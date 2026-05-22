import { log } from './authUtils';

const STORAGE_KEYS = {
  WEBAUTHN_CONFIGURED: 'libido_webauthn_active_v2',
  WEBAUTHN_CREDENTIAL_ID: 'libido_webauthn_id_v2'
};

export const webAuthnService = {
  /**
   * Checks if WebAuthn is supported on the current platform/browser.
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 
      !!window.PublicKeyCredential && 
      !!navigator.credentials;
  },

  /**
   * Checks if the user has successfully configured biometrics (TouchID/FaceID) for this device.
   */
  isConfigured(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.WEBAUTHN_CONFIGURED) === 'true';
  },

  /**
   * Registers a new biometric credential using standard WebAuthn.
   * If it fails due to iframe sandbox restrictions (common in preview environments),
   * it throws a specialized error that allows activating the Secure Matrix Visual Scanner instead.
   */
  async registerBiometrics(nickname: string = 'Agente'): Promise<{ success: boolean; mode: 'webauthn' | 'visual_fallback' }> {
    if (!this.isSupported()) {
      throw new Error('WebAuthn não é suportado neste navegador. Utilize o PIN manual.');
    }

    try {
      // 1. Generate secure random values for challenge and user ID
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const userIdBytes = new Uint8Array(16);
      window.crypto.getRandomValues(userIdBytes);

      // 2. Identify Hostname safely
      const rpId = window.location.hostname || 'localhost';

      const creationOptions: CredentialCreationOptions = {
        publicKey: {
          challenge,
          rp: {
            name: 'A Matriz - Libido App',
            id: rpId,
          },
          user: {
            id: userIdBytes,
            name: `${nickname.toLowerCase().replace(/\s+/g, '')}@amatriz.com`,
            displayName: `Agente: ${nickname}`,
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },  // ES256 (ECDSA with SHA-256)
            { type: 'public-key', alg: -257 } // RS256 (RSA Signature with SHA-256)
          ],
          authenticatorSelection: {
            userVerification: 'required',
            authenticatorAttachment: 'platform' // Restricts to on-device TouchID / FaceID / Windows Hello
          },
          timeout: 30000,
        }
      };

      log('info', '[WEBAUTHN] Requesting biometric registration credentials...');
      const credential = await navigator.credentials.create(creationOptions) as PublicKeyCredential;

      if (credential) {
        log('info', '[WEBAUTHN] Biometric registration successful.', credential.id);
        localStorage.setItem(STORAGE_KEYS.WEBAUTHN_CONFIGURED, 'true');
        localStorage.setItem(STORAGE_KEYS.WEBAUTHN_CREDENTIAL_ID, credential.id);
        return { success: true, mode: 'webauthn' };
      }
      
      throw new Error('Falha ao gerar credencial biométrica.');
    } catch (err: any) {
      log('warn', '[WEBAUTHN] WebAuthn registration failed:', err);
      
      // Let's identify clean iframe sandbox restrictions/NotAllowedError
      const isSandboxOrDenied = err.name === 'NotAllowedError' || 
                                err.name === 'SecurityError' || 
                                err.message?.includes('iframe') || 
                                err.message?.includes('not allowed') ||
                                err.message?.includes('disallowed');

      if (isSandboxOrDenied) {
        // We will trigger visual fallback setup, telling the user about it
        return { success: true, mode: 'visual_fallback' };
      }

      throw new Error(err.message || 'Falha ao registrar identificação biométrica.');
    }
  },

  /**
   * Authenticates using WebAuthn.
   * If sandbox restrictions occur, it informs the caller to present the Visual Biometric Scanner.
   */
  async authenticateBiometrics(): Promise<{ success: boolean; mode: 'webauthn' | 'visual_fallback' }> {
    if (!this.isConfigured()) {
      throw new Error('Biometria não configurada para este dispositivo.');
    }

    if (!this.isSupported()) {
      throw new Error('WebAuthn não é suportado pelo dispositivo.');
    }

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const credentialId = localStorage.getItem(STORAGE_KEYS.WEBAUTHN_CREDENTIAL_ID);
      const allowCredentials: PublicKeyCredentialDescriptor[] = [];

      if (credentialId) {
        // Convert string ID back to array buffer or simply let navigator prompt
        // Chrome allows passing raw id inside array descriptors
        const rawId = new TextEncoder().encode(credentialId);
        allowCredentials.push({
          type: 'public-key',
          id: rawId
        });
      }

      const assertionOptions: CredentialRequestOptions = {
        publicKey: {
          challenge,
          allowCredentials,
          userVerification: 'required',
          timeout: 30000,
        }
      };

      log('info', '[WEBAUTHN] Requesting biometric unlock...');
      const assertion = await navigator.credentials.get(assertionOptions);

      if (assertion) {
        log('info', '[WEBAUTHN] Biometric assertion successful.');
        return { success: true, mode: 'webauthn' };
      }

      throw new Error('Operação cancelada ou falha na leitura.');
    } catch (err: any) {
      log('warn', '[WEBAUTHN] biometric authentication failed:', err);

      const isSandboxOrDenied = err.name === 'NotAllowedError' || 
                                err.name === 'SecurityError' || 
                                err.message?.includes('iframe') || 
                                err.message?.includes('not allowed') ||
                                err.message?.includes('disallowed');

      if (isSandboxOrDenied) {
        return { success: true, mode: 'visual_fallback' };
      }

      throw new Error(err.message || 'Falha na autenticação biométrica.');
    }
  },

  /**
   * Opt-in manually for visual fallback biometrics when standard WebAuthn is unavailable or restricted
   */
  async enableVisualBiometrics(): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.WEBAUTHN_CONFIGURED, 'true');
    log('info', '[WEBAUTHN] Visual Biometrics fallback configured.');
  },

  /**
   * Disables biometric authentication
   */
  disableBiometrics(): void {
    localStorage.removeItem(STORAGE_KEYS.WEBAUTHN_CONFIGURED);
    localStorage.removeItem(STORAGE_KEYS.WEBAUTHN_CREDENTIAL_ID);
    log('info', '[WEBAUTHN] Biometrics disabled.');
  }
};
