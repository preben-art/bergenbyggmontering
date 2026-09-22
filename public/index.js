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

const GISLE_STOP = new Set([
    "og", "eller", "det", "den", "dei", "en", "et", "som", "paa", "for", "med",
    "til", "av", "er", "vi", "du", "dere", "kan", "skal", "har", "om", "hva",
    "hvor", "naar", "denne", "dette", "siden", "side", "oss", "jeg", "meg",
    "deg", "ikke", "vaere", "noe", "saa", "her", "der", "gjor", "gjore", "gjores",
]);

let gisleHub = null;

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

function gisleNorm(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/é/g, "e");
}

function gisleWords(value) {
  return gisleNorm(value)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !GISLE_STOP.has(word));
}

function gisleMentions(hay, name) {
  const token = gisleNorm(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!token) return false;
  return new RegExp(`(^|[^a-z0-9])${token}([^a-z0-9]|$)`).test(gisleNorm(hay));
}

function gislePlaces() {
  const fromHub = gisleHub && Array.isArray(gisleHub.places) ? gisleHub.places.map((place) => place.name) : [];
  const names = fromHub.length ? fromHub : GISLE_PLACES;
  return names.slice().sort((a, b) => b.length - a.length);
}

function gisleCollectSections() {
  if (typeof document === "undefined") return [];
  const chat = document.getElementById("gisle-root");
  const sections = [];
  let current = null;
  document.querySelectorAll("h1, h2, h3, p, li").forEach((node) => {
    if (chat && chat.contains(node)) return;
    if (node.closest("nav, script, style")) return;
    const text = (node.innerText || "").replace(/[✓•●]/g, " ").replace(/\s+/g, " ").trim();
    if (text.length < 28) return;
    if (/^H[1-3]$/.test(node.tagName)) {
      current = { title: text.slice(0, 160), bits: [] };
      sections.push(current);
      return;
    }
    if (!current) {
      current = { title: document.title || "Siden", bits: [] };
      sections.push(current);
    }
    if (!current.bits.includes(text)) current.bits.push(text);
  });
  return sections.filter((section) => section.bits.length);
}

function gisleSentences(section, words) {
  const pool = section.bits
    .join(" ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 40 && sentence.length < 280);
  const ranked = pool
    .map((sentence) => {
      const hay = gisleNorm(sentence);
      const score = words.reduce((sum, word) => sum + (hay.includes(word) ? 1 : 0), 0);
      return { sentence, score };
    })
    .sort((a, b) => b.score - a.score);
  const picked = ranked.filter((item) => item.score > 0).slice(0, 2);
  const chosen = (picked.length ? picked : ranked.slice(0, 1)).map((item) => item.sentence);
  return chosen.join(" ");
}

function gisleReply(text, memory) {
  const raw = String(text || "").trim();
  const q = gisleNorm(raw);
  const place = gislePlaces().find((name) => gisleMentions(raw, name)) || "";
  if (place) memory.place = place;
  const booking = /befaring|book|bestill|ring meg|ta kontakt/.test(q);

  if (/hvem er du|hva heter du|er du gisle/.test(q)) {
    return {
      text: "Jeg er Gisle Bjotveit. Jeg leder våtrom og rør hos oss. Spør om det som står på siden, så svarer jeg ut fra det.",
      book: false,
    };
  }

  if (/^(hei|hallo|heisann|god dag)\b/.test(q) && gisleWords(raw).length < 3) {
    return {
      text: "Hei. Si hva det gjelder, så tar jeg det fra siden du står på.",
      book: false,
    };
  }

  if (/adresse|hvor holder|torget|org.?nr|organisasjonsnummer/.test(q)) {
    const org = gisleHub && gisleHub.organization;
    const phone = org ? org.telephone : "+47 917 27 100";
    const email = org ? org.email : "post@bergenbyggmontering.no";
    const street = org ? `${org.address.streetAddress}, ${org.address.postalCode} ${org.address.addressLocality}` : "Torget 1, 5014 Bergen";
    const number = org ? org.organizationNumber : "934686283";
    return {
      text: `Vi holder til på ${street}. Org.nr ${number}. Telefon ${phone}, e-post ${email}.`,
      book: false,
    };
  }

  const sections = gisleCollectSections();
  const words = gisleWords(raw);
  const ranked = sections
    .map((section) => {
      const title = gisleNorm(section.title);
      const hay = gisleNorm(section.bits.join(" "));
      let score = words.reduce((sum, word) => {
        if (title.includes(word)) return sum + 8;
        return sum + (hay.includes(word) ? 1 : 0);
      }, 0);
      if (memory.topic && section.title === memory.topic) score += 3;
      return { section, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked[0]) memory.topic = ranked[0].section.title;

  const parts = [];
  if (place) {
    parts.push(`${place} står oppført på siden. Vi tar boliger i Bergen og omegn, på stedene som er listet der.`);
  } else if (/omrade|dekker|kommer dere|oslo|oygarden|bjornafjorden|alver|osteroy/.test(q)) {
    parts.push("Siden lister Bergen med stedene der, pluss Sotra, Askøy, Os, Nordhordland og Austevoll. Står stedet ditt ikke der, skriv det, så sier vi ifra om vi kan ta jobben.");
  }

  if (ranked[0]) {
    const spoken = gisleSentences(ranked[0].section, words);
    if (spoken) parts.push(spoken);
  }

  if (!parts.length) {
    const first = sections.find((section) => section.bits[0]);
    parts.push(
      (first && first.bits[0]) ||
        "Vi rehabiliterer boliger i Bergen. Spør om bad, rør, tak, fasade, tømrer eller tilbygg, så tar jeg det fra teksten på siden."
    );
  }

  if (booking) {
    parts.push("Legg inn navn og telefon nederst, så sender jeg det i samme kontaktskjema.");
  }

  return { text: parts.join(" "), book: booking };
}

function gisleWelcome(page) {
  const here = {
    bad: "Du er inne på bad.",
    tak: "Du er inne på tak.",
    ror: "Du er inne på rør.",
    fasade: "Du er inne på fasade.",
    tomrer: "Du er inne på tømrer.",
    tilbygg: "Du er inne på tilbygg.",
    brl: "Du er inne på borettslag og sameier.",
    total: "Du er inne på totalrenovering.",
    fag: "Du er inne på faginnsikt.",
    hjem: "Du er på forsiden.",
  };
  return `Hei, jeg er Gisle. ${here[page.id] || here.hjem} Spør om det som står her, så svarer jeg ut fra siden.`;
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
  const memory = { topic: "", place: "" };
  const abovePhone = document.getElementById("contact-widget-container");
  fetch("/knowledgehub.json")
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (data) gisleHub = data;
    })
    .catch(() => {});

  if (!document.getElementById("gisle-style")) {
    const style = document.createElement("style");
    style.id = "gisle-style";
    style.textContent = `
      #gisle-panel {
        width: min(400px, calc(100vw - 24px));
        height: min(860px, calc(100dvh - 24px));
      }
      @media (max-width: 720px) {
        #gisle-root.gisle-open { inset: 0; right: 0; bottom: 0; }
        #gisle-panel {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100dvh;
          max-height: none;
          border-radius: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

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
  panel.id = "gisle-panel";
  panel.hidden = true;
  panel.style.cssText =
    "display:none;flex-direction:column;background:#fff;color:#161616;border-radius:28px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.28);border:1px solid #e6e6e6;";

  const header = document.createElement("div");
  header.style.cssText =
    "display:flex;align-items:center;gap:12px;padding:14px 16px;background:#111;color:#fff;flex:none;";
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
  messages.style.cssText = "flex:1;min-height:0;overflow:auto;padding:16px 14px 8px;background:#efeae2;";

  const form = document.createElement("form");
  form.style.cssText = "display:grid;gap:8px;padding:8px 10px calc(10px + env(safe-area-inset-bottom));border-top:1px solid #e4e0d8;background:#f7f4ee;flex:none;";

  const contact = document.createElement("div");
  contact.hidden = true;
  contact.style.cssText = "display:none;grid-template-columns:1fr 1fr;gap:8px;";
  const nameInput = field("Navn", "text", "Ola Nordmann");
  const phoneInput = field("Telefon", "tel", "900 00 000");
  const emailInput = field("E-post", "email", "navn@epost.no");
  emailInput.wrap.style.gridColumn = "1 / -1";
  contact.append(nameInput.wrap, phoneInput.wrap, emailInput.wrap);

  const showContact = (open) => {
    contact.hidden = !open;
    contact.style.display = open ? "grid" : "none";
    consent.hidden = !open;
    if (open) nameInput.input.focus();
  };

  const starters = document.createElement("div");
  starters.style.cssText = "display:flex;gap:8px;overflow-x:auto;flex-wrap:nowrap;padding-bottom:2px;";
  [
    ["Nytt bad", "Vi skal ha nytt bad. Hva gjør dere?"],
    ["Tak som lekker", "Taket lekker. Hva ser dere etter?"],
    ["Hva koster det?", "Hva koster en sånn jobb?"],
    ["Borettslag", "Vi er et borettslag som skal ta bad og rør."],
    ["Book befaring", "Jeg vil booke befaring."],
  ].forEach(([label, text]) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.textContent = label;
    chip.style.cssText =
      "flex:none;border:1px solid #d5d8d0;background:#fff;color:#1c1f18;border-radius:999px;padding:7px 12px;font-size:13px;font-weight:650;cursor:pointer;";
    chip.addEventListener("click", () => {
      messageInput.value = text;
      form.requestSubmit();
    });
    starters.appendChild(chip);
  });

  const composer = document.createElement("div");
  composer.style.cssText = "display:flex;gap:8px;align-items:flex-end;";
  const messageInput = document.createElement("textarea");
  messageInput.rows = 1;
  messageInput.placeholder = "Skriv en melding";
  messageInput.style.cssText =
    "flex:1;min-height:44px;max-height:120px;box-sizing:border-box;border:1px solid #ddd;border-radius:22px;padding:11px 14px;resize:none;font:inherit;font-size:16px;background:#fff;";

  const sendBtn = document.createElement("button");
  sendBtn.type = "submit";
  sendBtn.textContent = "Send";
  sendBtn.style.cssText =
    "flex:none;background:#111;color:#fff;border:0;border-radius:999px;min-height:44px;padding:0 16px;font-weight:700;cursor:pointer;";

  const consent = document.createElement("p");
  consent.hidden = true;
  consent.style.cssText = "margin:0;font-size:11px;color:#555;line-height:1.4;";
  consent.append("Send bruker samme kontaktskjema. Du godtar ");
  const privacyLink = document.createElement("a");
  privacyLink.href = "/personvern.html";
  privacyLink.textContent = "personvernerklæringen";
  privacyLink.style.color = "#111";
  consent.append(privacyLink, ".");

  composer.append(messageInput, sendBtn);
  form.append(starters, contact, composer, consent);
  panel.append(header, messages, form);
  root.append(panel, launcher);
  document.body.appendChild(root);

  addBubble(messages, gisleWelcome(page), "gisle");

  const setOpen = (open) => {
    panel.hidden = !open;
    panel.style.display = open ? "flex" : "none";
    launcher.style.display = open ? "none" : "flex";
    root.classList.toggle("gisle-open", open);
    document.body.style.overflow = open && window.matchMedia("(max-width: 720px)").matches ? "hidden" : "";
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
          `Takk, ${details.name}. Det er sendt. Vi tar kontakt på ${details.phone}.`,
          "gisle"
        );
        trackEvent("conversion", "form_submit_success", "gisle_chat");
        showContact(false);
        nameInput.input.value = "";
        phoneInput.input.value = "";
        emailInput.input.value = "";
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

    const reply = gisleReply(text || "hva gjør dere", memory);
    if (reply.book) showContact(true);
    const started = details.name || details.phone || details.email;
    if (reply.book && started) {
      const missing = [];
      if (!details.name) missing.push("navn");
      if (!details.phone) missing.push("telefon");
      if (!gisleValidEmail(details.email)) missing.push("e-post");
      addBubble(messages, `${reply.text} Mangler ${missing.join(", ")}.`, "gisle");
      return;
    }
    addBubble(messages, reply.text, "gisle");
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
      ? "max-width:86%;background:#719248;color:#111;border-radius:18px 18px 4px 18px;padding:10px 14px;font-size:15.5px;line-height:1.4;white-space:pre-wrap;"
      : "max-width:86%;background:#fff;color:#222;border-radius:18px 18px 18px 4px;padding:10px 14px;font-size:15.5px;line-height:1.4;white-space:pre-wrap;";
  bubble.textContent = text;
  row.appendChild(bubble);
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}
