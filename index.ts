import type { AdapterOptions } from "./types.js";
import type { CaptchaAdapter } from "adminforth";

declare global {
  interface Window {
    turnstile: {
      render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void }) => void;
    };
  }
}


export default class CaptchaAdapterReCaptcha implements CaptchaAdapter {
  options: AdapterOptions;
  private token: string;

  constructor(options: AdapterOptions) {
    this.options = options;
  }

  getScriptSrc(): string {
    return `https://www.google.com/recaptcha/api.js`;
  }

  getSiteKey(): string {
    return this.options.siteKey;
  }

  getWidgetId(): string {
    return 'recaptcha-container';
  }

  getRenderWidgetCode(): string {
    return `
      window.renderCaptchaWidgetReCaptcha = function(containerId, siteKey, onSuccess) {
        grecaptcha.render('recaptcha-container', {
          'sitekey' : '6LdI09UrAAAAAAKUsWJRh7k5Bca4RUw_OOeX2q-Z',
          'callback' : function(token) {
            if (typeof onSuccess === 'function') {
              onSuccess(token);
            }
          },
        });
      };
    `;
  }

  getRenderWidgetFunctionName(): string {
    return 'renderCaptchaWidgetReCaptcha';
  }

  async validate(token: string, ip: string): Promise<Record<string, any>> {
    const formData = new FormData();
    formData.append('secret', this.options.secretKey);
    formData.append('response', token);
    formData.append('remoteip', ip);
    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Turnstile validation error:', error);
        return { success: false, 'error-codes': ['internal-error'] };
    }
  }
 
}