// Scheduled "fresh start": really deletes every guest, every logged drink and every
// photo (thumbnail + full size) from Firestore. The bar menu and settings are kept.
// Run by .github/workflows/fresh-start.yml, so it needs no browser and no input.
//
// It uses the same two-step delete the app's own Purge button uses (the security
// rules only allow deleting a record that was first marked with the passcode):
//   guests: archived -> delete    drinks: purged -> delete    photos: hidden -> delete
//
// PURGE_MODE=live  only runs inside a window around PURGE_AT (waits for it if early)
//            test  deletes only records whose guest name starts with "ZZ" (any time)
//            dry   counts what would be deleted, deletes nothing
var PROJECT = "wedding-drink-tracker";
var BASE = "https://firestore.googleapis.com/v1/projects/" + PROJECT + "/databases/(default)/documents";
var DOC = "projects/" + PROJECT + "/databases/(default)/documents";
var CODE = process.env.WEDDING_CODE || "cheers2026";
var MODE = process.env.PURGE_MODE || "live";
var PURGE_AT = Date.parse(process.env.PURGE_AT || "2026-11-06T22:00:00Z"); // 5:00 PM Eastern
var EARLY_LIMIT_MS = 100 * 60 * 1000;      // refuse to start more than this long before PURGE_AT
var LATE_LIMIT_MS = 8 * 3600 * 1000;       // refuse to run this long after (e.g. next year's cron)
var MARKER = "purge-" + new Date(PURGE_AT).toISOString().slice(0, 10);
var TEST_PREFIX = "ZZ";

function log(m){ console.log(new Date().toISOString() + "  " + m); }
function sleep(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
function idOf(d){ return d.name.split("/").pop(); }
function inScope(nameField){
  if(MODE !== "test") return true;
  return String(nameField || "").indexOf(TEST_PREFIX) === 0;
}

async function api(path, opts){
  for(var attempt = 1; attempt <= 4; attempt++){
    var r = await fetch(path, opts);
    if(r.status === 200) return r.json();
    var body = (await r.text()).slice(0, 300);
    if(r.status >= 500 || r.status === 429){ await sleep(attempt * 2000); continue; }
    throw new Error(r.status + " " + body);
  }
  throw new Error("gave up after retries: " + path);
}

// List ids plus one small field (so photo/log payloads stay tiny).
async function list(col, field){
  var out = [], tok = "";
  do {
    var url = BASE + "/" + col + "?pageSize=300&mask.fieldPaths=" + field + (tok ? "&pageToken=" + tok : "");
    var j = await api(url);
    out = out.concat(j.documents || []);
    tok = j.nextPageToken || "";
  } while(tok);
  return out.map(function(d){
    var f = d.fields && d.fields[field];
    return { name: d.name, id: idOf(d), who: f && f.stringValue };
  });
}

async function commit(writes){
  for(var i = 0; i < writes.length; i += 200){
    await api(BASE + ":commit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ writes: writes.slice(i, i + 200) }) });
  }
}
function markWrite(name, fields){
  var f = {}; Object.keys(fields).forEach(function(k){ f[k] = typeof fields[k] === "boolean" ? { booleanValue: fields[k] } : { stringValue: fields[k] }; });
  f.code = { stringValue: CODE };
  return { update: { name: name, fields: f }, updateMask: { fieldPaths: Object.keys(f) } };
}

async function snapshot(){
  var s = {};
  s.guests = (await list("weddingDrinkGuests", "name")).filter(function(d){ return inScope(d.who); });
  s.logs = (await list("weddingDrinkLog", "guestName")).filter(function(d){ return inScope(d.who); });
  s.photos = (await list("weddingDrinkPhotos", "guestName")).filter(function(d){ return inScope(d.who); });
  return s;
}

async function purgeOnce(s){
  // 1) mark (needs the passcode) 2) delete. Photo full-size docs go before their thumbnail doc,
  // because their delete rule looks the thumbnail up to see that it is hidden.
  await commit([].concat(
    s.logs.map(function(d){ return markWrite(d.name, { voided: true, purged: true }); }),
    s.guests.map(function(d){ return markWrite(d.name, { archived: true }); }),
    s.photos.map(function(d){ return markWrite(d.name, { hidden: true }); })
  ));
  await commit(s.photos.map(function(d){ return { delete: DOC + "/weddingDrinkPhotoFull/" + d.id }; }));
  await commit([].concat(
    s.logs.map(function(d){ return { delete: d.name }; }),
    s.photos.map(function(d){ return { delete: d.name }; }),
    s.guests.map(function(d){ return { delete: d.name }; })
  ));
}

async function markerExists(){
  var r = await fetch(BASE + "/weddingDrinkSettings/" + MARKER);
  return r.status === 200;
}

(async function main(){
  var now = Date.now();
  log("mode=" + MODE + "  purge time=" + new Date(PURGE_AT).toISOString() + "  now=" + new Date(now).toISOString());

  if(MODE === "live"){
    if(now > PURGE_AT + LATE_LIMIT_MS){ log("Past the purge window, nothing to do."); return; }
    if(now < PURGE_AT - EARLY_LIMIT_MS){ log("Too early for the purge window, nothing to do."); return; }
    if(await markerExists()){ log("Already purged (" + MARKER + "), nothing to do."); return; }
    if(now < PURGE_AT){
      log("Waiting " + Math.round((PURGE_AT - now) / 1000) + "s until the purge time...");
      await sleep(PURGE_AT - now);
      if(await markerExists()){ log("Another run purged while we waited, done."); return; }
    }
  }

  var s = await snapshot();
  log("found " + s.guests.length + " guests, " + s.logs.length + " drinks, " + s.photos.length + " photos");
  if(MODE === "dry"){ log("Dry run: nothing deleted."); return; }

  var totals = { guests: 0, logs: 0, photos: 0 };
  for(var pass = 1; pass <= 4; pass++){
    if(!(s.guests.length + s.logs.length + s.photos.length)) break;
    await purgeOnce(s);
    totals.guests += s.guests.length; totals.logs += s.logs.length; totals.photos += s.photos.length;
    log("pass " + pass + ": deleted " + s.guests.length + " guests, " + s.logs.length + " drinks, " + s.photos.length + " photos");
    await sleep(1500);
    s = await snapshot(); // pick up anything logged while the purge was running
  }
  var left = s.guests.length + s.logs.length + s.photos.length;
  if(left){ throw new Error(left + " records still present after 4 passes"); }

  if(MODE === "live"){
    await api(BASE + "/weddingDrinkSettings/" + MARKER + "?updateMask.fieldPaths=code&updateMask.fieldPaths=purgedAt&updateMask.fieldPaths=summary", {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({ fields: { code: { stringValue: CODE }, purgedAt: { stringValue: new Date().toISOString() }, summary: { stringValue: JSON.stringify(totals) } } })
    });
    log("Marker " + MARKER + " written.");
  }
  log("Done. Fresh start complete: " + JSON.stringify(totals));
})().catch(function(e){ console.error("PURGE FAILED: " + e.message); process.exit(1); });
