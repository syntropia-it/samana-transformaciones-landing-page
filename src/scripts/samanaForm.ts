import gsap from "gsap";
import { FLOW_TREE, type FlowStep, type FlowOption } from "../data/contactFlow";

const FORMSPREE_URL = import.meta.env.PUBLIC_FORMSPREE_ENDPOINT || "https://formspree.io/f/mykdzvoy";

const FALLBACK_HTML = `
  <p class="text-gray-400 text-sm">
    El formulario no está disponible en este momento.
    <a href="mailto:samanatransformaciones@gmail.com" class="text-samana-1 hover:underline">
      Escribinos directamente
    </a>.
  </p>
`;

export class SamanaForm {
  private container: HTMLElement | null;
  private progressBar: HTMLElement | null;
  private label: HTMLElement | null;
  private form: HTMLFormElement | null;
  private history: string[] = ["start"];
  private formData: Record<string, string> = {};

  constructor() {
    this.container = document.getElementById("step-container");
    this.progressBar = document.getElementById("progress-bar-line");
    this.label = document.getElementById("step-label");
    this.form = document.getElementById("samana-form") as HTMLFormElement;
    this.init();
  }

  private init() {
    if (!this.form || !this.container) return;
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    this.renderStep("start");
  }

  private renderStep(stepKey: string) {
    const step = FLOW_TREE[stepKey];
    if (!this.container) return;

    if (!step) {
      this.container.innerHTML = FALLBACK_HTML;
      return;
    }

    // Update progress (estimated 4 steps)
    const progress = (this.history.length / 4) * 100;
    gsap.to(this.progressBar, { width: `${progress}%`, duration: 0.5 });
    if (this.label) this.label.innerText = `Paso ${this.history.length}`;

    let html = "";

    // Back button
    if (this.history.length > 1) {
      html += `<button type="button" id="prev-btn" class="text-[10px] tracking-widest text-gray-300 hover:text-samana-1 mb-8 uppercase flex items-center gap-2"><span class="text-lg">←</span> Volver</button>`;
    }

    html += `<h3 class="text-2xl font-bold mb-8 text-white uppercase tracking-tight">${step.question}</h3>`;

    if (step.isFinal) {
      html += this.renderFinalForm();
    } else if (step.options) {
      html += `<div class="grid gap-3">`;
      step.options.forEach((opt: FlowOption) => {
        html += `
        <button 
          type="button" 
          data-next="${opt.next}" 
          data-value="${opt.value}" 
          class="step-opt group border border-white/5 p-8 hover:bg-white/5 text-left transition-all border-l-2 border-l-transparent hover:border-l-samana-1"
        >
          <span class="text-sm tracking-widest uppercase text-gray-300 group-hover:text-white">${opt.label}</span>
        </button>`;
      });
      html += `</div>`;
    }

    this.container.innerHTML = html;
    this.setupListeners(stepKey);
  }

  private renderFinalForm(): string {
    return `
    <div class="space-y-6">
      <div class="relative group">
        <label for="input-zona" class="sr-only">Zona o barrio</label>
        <input type="text" name="zona" id="input-zona" required 
          placeholder="ZONA O BARRIO (EJM: NORDELTA)" 
          class="form-input w-full p-2 focus:outline-none bg-transparent peer" />
        <div class="absolute bottom-0 left-0 w-0 h-px bg-samana-1 transition-all duration-500 peer-focus:w-full"></div>
      </div>

      <div class="relative group">
        <label for="input-name" class="sr-only">Nombre completo</label>
        <input type="text" name="name" id="input-name" required 
          placeholder="NOMBRE COMPLETO" 
          class="form-input w-full p-2 focus:outline-none bg-transparent peer" />
        <div class="absolute bottom-0 left-0 w-0 h-px bg-samana-1 transition-all duration-500 peer-focus:w-full"></div>
      </div>

      <div class="relative group">
        <label for="input-email" class="sr-only">Email de contacto</label>
        <input type="email" name="email" id="input-email" required 
          placeholder="EMAIL DE CONTACTO" 
          class="form-input w-full p-2 focus:outline-none bg-transparent peer" />
        <div class="absolute bottom-0 left-0 w-0 h-px bg-samana-1 transition-all duration-500 peer-focus:w-full"></div>
      </div>

      <div class="relative group">
        <label for="input-phone" class="sr-only">Teléfono de contacto</label>
        <input type="tel" name="phone" id="input-phone" required 
          placeholder="TELÉFONO DE CONTACTO" 
          class="form-input w-full p-2 focus:outline-none bg-transparent peer" />
        <div class="absolute bottom-0 left-0 w-0 h-px bg-samana-1 transition-all duration-500 peer-focus:w-full"></div>
      </div>

      <div class="relative group">
        <label for="input-vision" class="sr-only">Cuéntanos tu visión</label>
        <textarea name="vision" id="input-vision" 
          placeholder="CUÉNTANOS TU VISIÓN..." 
          class="form-input h-32 w-full p-2 resize-none focus:outline-none bg-transparent peer"
        ></textarea>
        <div class="absolute bottom-0 left-0 w-0 h-px bg-samana-1 transition-all duration-500 peer-focus:w-full"></div>
      </div>

      <button type="submit" class="w-full bg-samana-1 text-black font-bold py-5 mt-6 tracking-[0.2em] uppercase hover:bg-white transition-all duration-500 shadow-lg shadow-samana-1/10">
        Enviar Proyecto
      </button>
    </div>`;
  }

  private setupListeners(stepKey: string) {
    // Option buttons
    this.container?.querySelectorAll(".step-opt").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        this.formData[stepKey] = target.dataset.value!;
        this.history.push(target.dataset.next!);
        this.transition(() => this.renderStep(target.dataset.next!));
      });
    });

    // Back button
    document.getElementById("prev-btn")?.addEventListener("click", () => {
      this.history.pop();
      this.transition(() =>
        this.renderStep(this.history[this.history.length - 1]),
      );
    });
  }

  private transition(cb: () => void) {
    if (!this.container) {
      cb();
      return;
    }
    gsap.to(this.container, {
      opacity: 0,
      x: -20,
      duration: 0.3,
      onComplete: () => {
        cb();
        gsap.to(this.container, { opacity: 1, x: 0, duration: 0.3 });
      },
    });
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    const formElement = e.target as HTMLFormElement;
    const submitBtn = formElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement | null;

    if (!submitBtn) return;

    submitBtn.disabled = true;
    submitBtn.innerText = "PROCESANDO TU VISIÓN...";

    try {
      const formData = new FormData(formElement);
      const payload = {
        ...this.formData,
        ...Object.fromEntries(formData),
      };

      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "form_submit", {
          form_name: "samana_contact",
          service_type: payload.type || "unknown",
          property_type: payload.property || "unknown",
          area_type: payload.area || "unknown",
          user_email: payload.email || "anonymous",
        });
      }

      const response = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "conversion", {
            send_to: "samana_contact_conversion",
          });
        }
        window.location.href = "/gracias";
      } else {
        throw new Error(`Server responded with ${response.status}`);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      submitBtn.disabled = false;
      submitBtn.innerText = "ERROR - REINTENTAR";
      gsap.to(submitBtn, { x: [-10, 10, -10, 10, 0], duration: 0.4 });

      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "form_error", {
          form_name: "samana_contact",
          error_message: error instanceof Error ? error.message : "unknown",
        });
      }
    }
  }
}
