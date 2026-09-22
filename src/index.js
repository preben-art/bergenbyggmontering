/*
© 2026 Bergen Byggmontering AS – Levert av VCTRA.
Main Logic (Vanilla JS, ESM)
*/



document.addEventListener("DOMContentLoaded", () => {
  console.log("Bergen Byggmontering Site Initialized");

  // --- Event Tracking Logic ---
  const trackEvent = (category, action, label) => {
    console.log(
      `[Analytics] Event: ${category} | Action: ${action} | Label: ${label ?? ""}`
    );
  };

  // Attach listeners to all elements with data-event attributes
  document.querySelectorAll("[data-event]").forEach((element) => {
    const eventType = element.dataset.event;
    const category = element.dataset.eventCategory || "engagement";
    const label = element.dataset.eventLabel || "unknown";

    if (eventType === "click") {
      element.addEventListener("click", () => trackEvent(category, "click", label));
    } else if (eventType === "submit") {
      // NOTE: submit events typically belong to forms, but we keep it generic
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

  // --- Contact Form Handling (EmailJS) ---
  const contactForm = document.getElementById("contactForm");

  if (contactForm && contactForm.dataset.emailjsBound !== "true") {
    const emailServiceId = "service_155c6jh";
    const emailTemplateId = "template_9niy7i4";
    const emailPublicKey = "ZOIMC2E_FJHqarwmw";

    contactForm.dataset.emailjsBound = "true";

    if (window.emailjs) {
      window.emailjs.init(emailPublicKey);
    }

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Honeypot check (Antispam)
      const honeypot = contactForm.querySelector(
        '[name="honeypot"], [name="honeypot_field"]'
      );
      if (honeypot && honeypot.value) {
        console.warn("Spam detected via honeypot");
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalContent = submitBtn ? submitBtn.innerHTML : "Send";

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sender...";
      }

      try {
        if (!window.emailjs) {
          throw new Error("EmailJS er ikke lastet.");
        }

        await window.emailjs.sendForm(
          emailServiceId,
          emailTemplateId,
          contactForm
        );

        alert(
          "Takk! Vi har mottatt henvendelsen din og tar kontakt så snart vi kan."
        );
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

  // --- AI Chat Logic (Bygg-Assistent) ---
  const toggleBtn = document.getElementById("ai-toggle-btn");
  const closeBtn = document.getElementById("ai-close-btn");
  const chatWindow = document.getElementById("ai-chat-window");
  const inputEl = document.getElementById("ai-input");
  const sendBtn = document.getElementById("ai-send-btn");
  const messagesContainer = document.getElementById("ai-messages");

  const toggleChat = () => {
    if (!chatWindow || !toggleBtn) return;

    const isHidden = chatWindow.classList.contains("hidden");

    if (isHidden) {
      chatWindow.classList.remove("hidden");
      toggleBtn.classList.add("hidden");
      trackEvent("engagement", "open_chat", "ai_widget");
      setTimeout(() => inputEl && inputEl.focus && inputEl.focus(), 100);
    } else {
      chatWindow.classList.add("hidden");
      toggleBtn.classList.remove("hidden");
    }
  };

  if (toggleBtn) toggleBtn.addEventListener("click", toggleChat);
  if (closeBtn) closeBtn.addEventListener("click", toggleChat);

  const addMessage = (text, role) => {
    if (!messagesContainer) return;

    const row = document.createElement("div");
    row.className = `flex ${
      role === "user" ? "justify-end" : "justify-start"
    } animate-fade-in-up`;

    const bubbleClass =
      role === "user"
        ? "bg-brand-primary text-white rounded-br-none"
        : "bg-white border border-gray-200 text-gray-700 rounded-bl-none shadow-sm";

    const bubble = document.createElement("div");
    bubble.className = `max-w-[85%] rounded-2xl px-4 py-2 text-sm ${bubbleClass} mb-2`;

    // Convert newlines to breaks for AI responses
    bubble.innerHTML = String(text).replace(/\n/g, "<br>");

    row.appendChild(bubble);
    messagesContainer.appendChild(row);

    requestAnimationFrame(() => {
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  const handleSend = async () => {
    if (!inputEl) return;

    const text = (inputEl.value || "").trim();
    if (!text) return;

    // 1) Add User Message
    addMessage(text, "user");
    inputEl.value = "";
    trackEvent("engagement", "chat_message_sent", "user");

    if (!messagesContainer) return;

    // 2) Add Loading Indicator
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "flex justify-start mb-2";
    loadingDiv.innerHTML = `
      <div class="bg-gray-100 text-gray-500 rounded-2xl rounded-bl-none px-4 py-2 text-xs flex items-center space-x-1">
        <span>Tenker</span>
        <span class="animate-bounce">.</span>
        <span class="animate-bounce delay-100">.</span>
        <span class="animate-bounce delay-200">.</span>
      </div>
    `;
    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      const response = await window.askAI(text);

      if (messagesContainer.contains(loadingDiv)) {
        messagesContainer.removeChild(loadingDiv);
      }
      addMessage(response, "ai");
    } catch (err) {
      if (messagesContainer.contains(loadingDiv)) {
        messagesContainer.removeChild(loadingDiv);
      }
      console.error("AI error:", err);
      addMessage("Beklagar — noko gjekk gale. Prøv igjen om litt.", "ai");
    }
  };

  if (sendBtn) sendBtn.addEventListener("click", handleSend);

  if (inputEl) {
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleSend();
    });
  }
});

/**
 * Local fallback for Bygg-Assistent.
 * The live site called askAI() but never published the function.
 * Answers stay in Norwegian and follow the company's own positioning.
 */
window.askAI = async function askAI(text) {
  const q = String(text || "").toLowerCase();

  const replies = [
    {
      test: /pris|kost|tilbud|estimat|hva koster/,
      reply:
        "Pris avhenger av størrelse, tilkomst, teknisk tilstand og materialvalg. Vi gir en realistisk ramme etter befaring – ring +47 917 27 100 eller bruk kontaktskjemaet.",
    },
    {
      test: /bad|våtrom|membran|sluk/,
      reply:
        "Vi totalrenoverer bad etter våtromsnormen: riving, fall, membran, rør-i-rør, flis og innredning, med dokumentasjon ved overlevering. Flis-på-flis over gammel membran tar vi ikke.",
    },
    {
      test: /tak|lekkasje|undertak|takstein/,
      reply:
        "På tak er det undertaket som holder huset tett, ikke bare steinen. Vi sjekker undertak, lufting, lekter og beslag – særlig viktig i Bergen. Tak eldre enn ca. 30 år bør vurderes.",
    },
    {
      test: /rør|vvs|lekk|varmtvann/,
      reply:
        "Egne rørleggere tar service og rehabilitering: rør-i-rør, varmtvannstank, sanitær og lekkasjesøk. Vi jobber tett med tømrerne slik at føringer og tetting henger sammen.",
    },
    {
      test: /fasade|kledning|vindu|etterisol/,
      reply:
        "Utvendig oppgradering handler om vindsperre, utlekting og isolasjon – ikke bare ny kledning. Det gir mindre trekk og bedre energibruk, tilpasset vestlandsklima.",
    },
    {
      test: /tilbygg|påbygg|utvid/,
      reply:
        "Tilbygg og mindre nybygg tar vi når prosjektet passer. Kritisk punkt er overgangen mellom nytt og gammelt tak. Søknad til kommunen kan vi bistå med via partner.",
    },
    {
      test: /borettslag|sameie|brl|styre/,
      reply:
        "Vi jobber boligrettet for borettslag og sameier: rør/stammer, tak, fasade/vinduer og bad i flere enheter. Ryddighet, beboerinfo og HMS er en del av leveransen.",
    },
    {
      test: /næring|kontorbygg|kontor/,
      reply:
        "Vi tar ikke rene kontorbygg eller typiske næringsprosjekter. Fokuset er bolig og boligbygg – inkludert borettslag og sameier.",
    },
    {
      test: /jobb|ledig|lærling|søke/,
      reply:
        "Vi søker tømrere, rørleggere, flisleggere og lærlinger når vi kan gi tett oppfølging. Ta kontakt på post@bergenbyggmontering.no.",
    },
    {
      test: /kontakt|befaring|telefon|epost|mail/,
      reply:
        "Ring +47 917 27 100, skriv til post@bergenbyggmontering.no, eller send skjemaet nederst på siden. Adresse: Torget 1, 5014 Bergen.",
    },
  ];

  await new Promise((r) => setTimeout(r, 350));
  const hit = replies.find((item) => item.test.test(q));
  if (hit) return hit.reply;

  return "Bergen Byggmontering AS rehabiliterer boliger i Bergen og omegn: totalrenovering, tømrer, bad, rør, tak, fasade og tilbygg. Fortell hva slags jobb du vurderer, så peker jeg deg videre – eller book befaring på +47 917 27 100.";
};