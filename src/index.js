/*
© 2026 Bergen Byggmontering AS – Levert av VCTRA.
Main Logic (Vanilla JS, ESM)
*/

const EMAIL_SERVICE_ID = "service_155c6jh";
const EMAIL_TEMPLATE_ID = "template_9niy7i4";
const EMAIL_PUBLIC_KEY = "ZOIMC2E_FJHqarwmw";

const GISLE_PLACES = [
  "Bergen Sentrum",
  "Danmarksplass",
  "Drotningsvik",
  "Fyllingsdalen",
  "Nordhordland",
  "Møhlenpris",
  "Fjøsanger",
  "Loddefjord",
  "Ytrebygda",
  "Bergenhus",
  "Sandviken",
  "Austevoll",
  "Kronstad",
  "Damsgård",
  "Laksevåg",
  "Eidsvåg",
  "Nesttun",
  "Nordnes",
  "Fana",
  "Årstad",
  "Landås",
  "Nygård",
  "Paradis",
  "Sandsli",
  "Kokstad",
  "Lagunen",
  "Olsvik",
  "Tertnes",
  "Morvik",
  "Bønes",
  "Rådal",
  "Åsane",
  "Minde",
  "Arna",
  "Sotra",
  "Askøy",
  "Hop",
  "Bergen",
  "Os",
];

const GISLE_TOPICS = [
  {
    id: "pris",
    test: /pris|kost|tilbud|estimat|budsjett|hva koster/,
    reply:
      "Pris avhenger av størrelse, tilkomst, tilstand og materialer. Jeg setter ikke et tall her. Etter befaring får dere en realistisk ramme.",
  },
  {
    id: "bad",
    test: /bad|våtrom|membran|sluk|flis/,
    reply:
      "På bad totalrenoverer vi etter våtromsnormen: riving, fall, membran, rør-i-rør, flis og innredning, med dokumentasjon ved overlevering. Flis oppå gammel membran tar vi ikke.",
  },
  {
    id: "tak",
    test: /tak|undertak|takstein|beslag/,
    reply:
      "På tak er det undertaket som holder huset tett, ikke bare steinen. Vi ser på undertak, lufting, lekter og beslag. Tak eldre enn rundt 30 år bør vurderes, særlig i Bergen.",
  },
  {
    id: "ror",
    test: /rør|ror|vvs|varmtvann|stamme|lekk/,
    reply:
      "Egne rørleggere tar service og rehabilitering: rør-i-rør, varmtvannstank, sanitær og lekkasjesøk. Vi jobber sammen med tømrerne, så føringer og tetting henger sammen.",
  },
  {
    id: "fasade",
    test: /fasade|kledning|vindu|etterisol/,
    reply:
      "Utvendig handler det om vindsperre, utlekting og isolasjon, ikke bare ny kledning. Det gir mindre trekk og passer vestlandsklima bedre.",
  },
  {
    id: "tilbygg",
    test: /tilbygg|påbygg|paabygg|utvid/,
    reply:
      "Tilbygg og mindre nybygg tar vi når prosjektet passer. Det kritiske er overgangen mellom nytt og gammelt tak. Søknad til kommunen kan vi bistå med via partner.",
  },
  {
    id: "brl",
    test: /borettslag|sameie|brl|styre|beboer/,
    reply:
      "For borettslag og sameier tar vi boligbygg: rør og stammer, tak, fasade og vinduer, og bad i flere enheter. Plan, beboerinfo og HMS er med i leveransen.",
  },
  {
    id: "tomrer",
    test: /tømr|tomr|innvendig|rehab/,
    reply:
      "Tømrerne tar innvendig rehabilitering og det som hører med i en totalrenovering. Vi koordinerer fagene så bad, rør og bygg går i samme løp.",
  },
  {
    id: "total",
    test: /total|hel hus|hele huset|oppuss/,
    reply:
      "Totalrenovering er hele boligen i ett løp: tømrer, bad, rør, og det utvendige når det trengs. Én ansvarlig mot dere, ikke løse fag hver for seg.",
  },
  {
    id: "naering",
    test: /næring|naering|kontorbygg|kontor|nybyggfelt/,
    reply:
      "Vi tar ikke rene kontorbygg eller typiske næringsprosjekter uten boligformål, og ikke store nybyggfelt. Fokuset er bolig og boligbygg.",
  },
  {
    id: "jobb",
    test: /ledig stilling|lærling|laerling|søke jobb|soke jobb|jobbe hos/,
    reply:
      "Vi hører gjerne fra tømrere, rørleggere, flisleggere og lærlinger når vi kan gi tett oppfølging. Skriv til post@bergenbyggmontering.no.",
  },
];

function gislePage() {
  const path = (typeof location === "undefined" ? "" : location.pathname || "").toLowerCase();
  if (path.includes("tjeneste-bad")) return { id: "bad", name: "badsiden" };
  if (path.includes("tjeneste-tak")) return { id: "tak", name: "taksiden" };
  if (path.includes("tjeneste-ror")) return { id: "ror", name: "rørsiden" };
  if (path.includes("tjeneste-fasade")) return { id: "fasade", name: "fasadesiden" };
  if (path.includes("tjeneste-tomrer")) return { id: "tomrer", name: "tømrersiden" };
  if (path.includes("tjeneste-tilbygg")) return { id: "tilbygg", name: "tilbyggsiden" };
  if (path.includes("tjeneste-brl")) return { id: "brl", name: "siden for borettslag og sameier" };
  if (path.includes("tjeneste-total")) return { id: "total", name: "siden for totalrenovering" };
  if (path.includes("faginnsikt")) return { id: "fag", name: "faginnsikt" };
  return { id: "hjem", name: "forsiden" };
}

function gisleFindPlace(text) {
  const q = String(text || "").toLowerCase();
  return GISLE_PLACES.find((place) => q.includes(place.toLowerCase())) || "";
}

function gisleReply(text, memory) {
  const q = String(text || "").toLowerCase();
  const page = gislePage();
  const place = gisleFindPlace(q);
  if (place) memory.place = place;

  if (/hvem er du|hva heter du|er du gisle/.test(q)) {
    return "Jeg er Gisle Bjotveit, avdelingsleder for våtrom og rør i Bergen Byggmontering. Spør om det du ser på siden, eller fyll inn navn, telefon og e-post og trykk Send, så går det i kontaktskjemaet.";
  }

  if (/adresse|hvor holder|torget|org|åpningstid|apningstid/.test(q)) {
    return "Vi holder til på Torget 1, 5014 Bergen. Org.nr 934686283. Telefon +47 917 27 100, e-post post@bergenbyggmontering.no.";
  }

  if (/telefon|ring|epost|e-post|mail/.test(q) && !/book|befaring/.test(q)) {
    return "Ring +47 917 27 100 eller skriv til post@bergenbyggmontering.no. Vil du heller booke her, fyller du inn feltene under og trykker Send. Da brukes samme skjema som nederst på siden.";
  }

  const hits = GISLE_TOPICS.filter((topic) => topic.test.test(q));
  if (hits.length) memory.topic = hits[0].id;
  else if (/denne siden|denne side|her på|om dette|hva gjør dere her|hva gjor dere her/.test(q)) {
    memory.topic = page.id;
  }

  const topic =
    GISLE_TOPICS.find((item) => item.id === memory.topic) ||
    GISLE_TOPICS.find((item) => item.id === page.id);

  const parts = [];
  if (place) {
    parts.push(`${place} er med i området vi allerede oppgir: Bergen og omegn, inkludert Sotra, Askøy, Os, Nordhordland og Austevoll.`);
  } else if (/område|omrade|dekker|kommer dere|kjele|oslo|øygarden|oygarden|bjørnafjorden|bjornafjorden|alver|osterøy|osteroy/.test(q)) {
    parts.push("Vi oppgir Bergen med bydelene og stedene på siden, pluss Sotra, Askøy, Os, Nordhordland og Austevoll. Står stedet ditt ikke der, skriv det i meldingen og send skjemaet, så sier vi ifra om vi kan ta jobben.");
  }

  if (hits.length) {
    parts.push(hits.slice(0, 2).map((item) => item.reply).join(" "));
  } else if (topic && /pris|dette|den|det\b|samme|videre|mer/.test(q) && memory.topic) {
    parts.push(topic.reply);
  } else if (/denne siden|denne side|her på|hva kan|hva gjør|hva gjor|fortell/.test(q) && topic) {
    parts.push(`Du er på ${page.name}. ${topic.reply}`);
  }

  if (!parts.length) {
    parts.push(
      "Bergen Byggmontering rehabiliterer boliger: totalrenovering, bad, rør, tak, fasade, tømrer og tilbygg. Privatkunder og borettslag. Ikke rene kontorbygg."
    );
    if (topic && page.id !== "hjem" && page.id !== "fag") {
      parts.push(`På ${page.name}: ${topic.reply}`);
    }
  }

  parts.push("Fyll inn navn, telefon og e-post under, skriv kort hva det gjelder, og trykk Send. Da går det i samme kontaktskjema.");
  return parts.join(" ");
}

function gisleValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

async function ensureEmailJs() {
  if (window.emailjs) {
    window.emailjs.init(EMAIL_PUBLIC_KEY);
    return;
  }
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("EmailJS ble ikke lastet."));
    document.head.appendChild(script);
  });
  window.emailjs.init(EMAIL_PUBLIC_KEY);
}

async function sendContactForm(fields) {
  await ensureEmailJs();
  const form = document.getElementById("contactForm");
  if (form) {
    const write = (name, value) => {
      const field = form.querySelector(`[name="${name}"]`);
      if (field) field.value = value;
    };
    write("name", fields.name);
    write("phone", fields.phone);
    write("email", fields.email);
    write("message", fields.message);
    const privacy = form.querySelector('[name="privacy"]');
    if (privacy) privacy.checked = true;
    const honeypot = form.querySelector('[name="honeypot"], [name="honeypot_field"]');
    if (honeypot) honeypot.value = "";
    await window.emailjs.sendForm(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, form);
    return;
  }
  await window.emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, {
    name: fields.name,
    phone: fields.phone,
    email: fields.email,
    message: fields.message,
  });
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Bergen Byggmontering Site Initialized");

  const trackEvent = (category, action, label) => {
    console.log(
      `[Analytics] Event: ${category} | Action: ${action} | Label: ${label ?? ""}`
    );
  };

  document.querySelectorAll("[data-event]").forEach((element) => {
    const eventType = element.dataset.event;
    const category = element.dataset.eventCategory || "engagement";
    const label = element.dataset.eventLabel || "unknown";

    if (eventType === "click") {
      element.addEventListener("click", () => trackEvent(category, "click", label));
    } else if (eventType === "submit") {
      element.addEventListener("submit", () => trackEvent(category, "submit", label));
    } else if (eventType === "view") {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              trackEvent(category, "view", label);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      observer.observe(element);
    }
  });

  const contactForm = document.getElementById("contactForm");
  if (contactForm && contactForm.dataset.emailjsBound !== "true") {
    contactForm.dataset.emailjsBound = "true";
    if (window.emailjs) window.emailjs.init(EMAIL_PUBLIC_KEY);

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const honeypot = contactForm.querySelector(
        '[name="honeypot"], [name="honeypot_field"]'
      );
      if (honeypot && honeypot.value) return;

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalContent = submitBtn ? submitBtn.innerHTML : "Send";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sender...";
      }

      try {
        await ensureEmailJs();
        await window.emailjs.sendForm(
          EMAIL_SERVICE_ID,
          EMAIL_TEMPLATE_ID,
          contactForm
        );
        alert("Takk! Vi har mottatt henvendelsen din og tar kontakt så snart vi kan.");
        contactForm.reset();
        trackEvent("conversion", "form_submit_success", "contact_main");
      } catch (error) {
        console.error("EmailJS-feil:", error);
        alert(
          "Beklager, meldingen kunne ikke sendes. Ring oss på +47 917 27 100 eller send e-post til post@bergenbyggmontering.no."
        );
        trackEvent("conversion", "form_submit_error", "contact_main");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalContent;
        }
      }
    });
  }

  mountGisle(trackEvent);
});

function mountGisle(trackEvent) {
  if (document.getElementById("gisle-root")) return;

  const page = gislePage();
  const memory = { topic: page.id === "hjem" || page.id === "fag" ? "" : page.id, place: "" };
  const abovePhone = document.getElementById("contact-widget-container");

  const root = document.createElement("div");
  root.id = "gisle-root";
  root.style.cssText = abovePhone
    ? "position:fixed;right:24px;bottom:96px;z-index:60;font-family:inherit;"
    : "position:fixed;right:24px;bottom:24px;z-index:60;font-family:inherit;";

  const launcher = document.createElement("button");
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Snakk med Gisle");
  launcher.style.cssText =
    "display:flex;align-items:center;gap:10px;border:0;background:#719248;color:#111;border-radius:999px;padding:6px 14px 6px 6px;box-shadow:0 10px 30px rgba(0,0,0,.18);cursor:pointer;font-weight:700;";

  const launcherPhoto = document.createElement("img");
  launcherPhoto.src = "/bilder/sjefen.webp";
  launcherPhoto.alt = "Gisle Bjotveit";
  launcherPhoto.style.cssText =
    "width:44px;height:44px;border-radius:50%;object-fit:cover;object-position:top;background:#fff;";
  const launcherText = document.createElement("span");
  launcherText.style.cssText = "display:grid;line-height:1.15;text-align:left;";
  const launcherLabel = document.createElement("span");
  launcherLabel.textContent = "Gisle";
  const launcherCredit = document.createElement("span");
  launcherCredit.textContent = "Powered by vctra.no";
  launcherCredit.style.cssText = "font-size:10px;font-weight:600;letter-spacing:0.01em;";
  launcherText.append(launcherLabel, launcherCredit);
  launcher.append(launcherPhoto, launcherText);

  const panel = document.createElement("section");
  panel.hidden = true;
  panel.style.cssText =
    "display:none;flex-direction:column;width:min(380px,calc(100vw - 32px));height:min(640px,78vh);background:#fff;color:#161616;border-radius:20px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.22);border:1px solid #e6e6e6;";

  const header = document.createElement("div");
  header.style.cssText =
    "display:flex;align-items:center;gap:12px;padding:14px 16px;background:#111;color:#fff;";
  const headerPhoto = launcherPhoto.cloneNode();
  headerPhoto.style.width = "48px";
  headerPhoto.style.height = "48px";
  const headerText = document.createElement("div");
  const headerName = document.createElement("strong");
  headerName.textContent = "Gisle";
  headerName.style.display = "block";
  const headerRole = document.createElement("span");
  headerRole.textContent = "Bergen Byggmontering";
  headerRole.style.cssText = "display:block;color:#c5d7a4;font-size:12px;";
  const headerCredit = document.createElement("a");
  headerCredit.href = "https://vctra.no/";
  headerCredit.target = "_blank";
  headerCredit.rel = "noopener noreferrer";
  headerCredit.textContent = "Powered by vctra.no";
  headerCredit.style.cssText = "display:block;color:#fff;font-size:11px;margin-top:2px;text-decoration:underline;";
  headerText.append(headerName, headerRole, headerCredit);
  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.textContent = "✕";
  closeBtn.setAttribute("aria-label", "Lukk");
  closeBtn.style.cssText =
    "margin-left:auto;background:transparent;border:0;color:#fff;font-size:18px;cursor:pointer;";
  header.append(headerPhoto, headerText, closeBtn);

  const messages = document.createElement("div");
  messages.style.cssText = "flex:1;overflow:auto;padding:14px;background:#f6f7f4;";

  const form = document.createElement("form");
  form.style.cssText = "display:grid;gap:8px;padding:12px;border-top:1px solid #ececec;background:#fff;";

  const fieldRow = document.createElement("div");
  fieldRow.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:8px;";
  const nameInput = field("Navn", "text", "Ola Nordmann");
  const phoneInput = field("Telefon", "tel", "900 00 000");
  const emailInput = field("E-post", "email", "navn@epost.no");
  emailInput.wrap.style.gridColumn = "1 / -1";
  fieldRow.append(nameInput.wrap, phoneInput.wrap, emailInput.wrap);

  const messageInput = document.createElement("textarea");
  messageInput.rows = 2;
  messageInput.placeholder = "Skriv hva det gjelder, eller spør om siden";
  messageInput.style.cssText =
    "width:100%;box-sizing:border-box;border:1px solid #ddd;border-radius:12px;padding:10px 12px;resize:none;font:inherit;";

  const sendBtn = document.createElement("button");
  sendBtn.type = "submit";
  sendBtn.textContent = "Send";
  sendBtn.style.cssText =
    "background:#111;color:#fff;border:0;border-radius:999px;padding:12px 16px;font-weight:700;cursor:pointer;";

  const consent = document.createElement("p");
  consent.style.cssText = "margin:0;font-size:11px;color:#555;line-height:1.4;";
  consent.append("Send bruker samme kontaktskjema. Du godtar ");
  const privacyLink = document.createElement("a");
  privacyLink.href = "/personvern.html";
  privacyLink.textContent = "personvernerklæringen";
  privacyLink.style.color = "#111";
  consent.append(privacyLink, ".");

  form.append(fieldRow, messageInput, sendBtn, consent);
  panel.append(header, messages, form);
  root.append(panel, launcher);
  document.body.appendChild(root);

  addBubble(
    messages,
    `Hei, jeg er Gisle. Du er på ${page.name}. Spør om bad, tak, rør eller det som står på siden. Når du trykker Send, går navn, telefon og e-post i samme kontaktskjema som resten av siden.`,
    "gisle"
  );

  const setOpen = (open) => {
    panel.hidden = !open;
    panel.style.display = open ? "flex" : "none";
    launcher.style.display = open ? "none" : "flex";
    if (open) {
      trackEvent("engagement", "open_chat", "gisle");
      messageInput.focus();
    }
  };
  launcher.addEventListener("click", () => setOpen(true));
  closeBtn.addEventListener("click", () => setOpen(false));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = messageInput.value.trim();
    const details = {
      name: nameInput.input.value.trim(),
      phone: phoneInput.input.value.trim(),
      email: emailInput.input.value.trim(),
      message: text,
    };
    if (text) addBubble(messages, text, "user");
    messageInput.value = "";

    const ready = details.name && details.phone && gisleValidEmail(details.email) && details.message;
    if (ready) {
      sendBtn.disabled = true;
      sendBtn.textContent = "Sender...";
      try {
        await sendContactForm(details);
        const formOnPage = document.getElementById("contactForm");
        if (formOnPage) formOnPage.reset();
        addBubble(
          messages,
          `Takk, ${details.name}. Forespørselen er sendt i kontaktskjemaet. Vi tar kontakt på ${details.phone} eller ${details.email}.`,
          "gisle"
        );
        trackEvent("conversion", "form_submit_success", "gisle_chat");
        messageInput.placeholder = "Spør Gisle om siden";
      } catch (error) {
        console.error("EmailJS-feil:", error);
        addBubble(
          messages,
          "Meldingen kom ikke frem. Ring +47 917 27 100 eller skriv til post@bergenbyggmontering.no.",
          "gisle"
        );
        trackEvent("conversion", "form_submit_error", "gisle_chat");
      } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = "Send";
      }
      return;
    }

    const reply = gisleReply(text || "hva kan dere hjelpe med", memory);
    const missing = [];
    if (!details.name) missing.push("navn");
    if (!details.phone) missing.push("telefon");
    if (!gisleValidEmail(details.email)) missing.push("e-post");
    if (!details.message) missing.push("en kort melding");
    addBubble(
      messages,
      `${reply} For å sende mangler ${missing.join(", ")}.`,
      "gisle"
    );
  });
}

function field(labelText, type, placeholder) {
  const wrap = document.createElement("label");
  wrap.style.cssText = "display:grid;gap:4px;font-size:11px;font-weight:700;";
  wrap.textContent = labelText;
  const input = document.createElement("input");
  input.type = type;
  input.placeholder = placeholder;
  input.autocomplete = type === "tel" ? "tel" : type === "email" ? "email" : "name";
  input.style.cssText =
    "width:100%;box-sizing:border-box;border:1px solid #ddd;border-radius:10px;padding:8px 10px;font:inherit;font-weight:500;";
  wrap.appendChild(input);
  return { wrap, input };
}

function addBubble(container, text, role) {
  const row = document.createElement("div");
  row.style.cssText = `display:flex;gap:8px;margin-bottom:10px;${role === "user" ? "justify-content:flex-end;" : "justify-content:flex-start;align-items:flex-end;"}`;
  if (role !== "user") {
    const photo = document.createElement("img");
    photo.src = "/bilder/sjefen.webp";
    photo.alt = "";
    photo.style.cssText =
      "width:28px;height:28px;border-radius:50%;object-fit:cover;object-position:top;flex:none;";
    row.appendChild(photo);
  }
  const bubble = document.createElement("div");
  bubble.style.cssText =
    role === "user"
      ? "max-width:80%;background:#719248;color:#111;border-radius:16px 16px 4px 16px;padding:10px 12px;font-size:14px;line-height:1.45;white-space:pre-wrap;"
      : "max-width:80%;background:#fff;color:#222;border:1px solid #e6e6e6;border-radius:16px 16px 16px 4px;padding:10px 12px;font-size:14px;line-height:1.45;white-space:pre-wrap;";
  bubble.textContent = text;
  row.appendChild(bubble);
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}
