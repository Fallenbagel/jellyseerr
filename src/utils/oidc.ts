import PopupWindow from '@app/utils/popupWindow';

class OIDCAuth extends PopupWindow {
  public async preparePopup(): Promise<void> {
    this.openPopup({
      title: 'OIDC Auth',
      path: '/api/v1/auth/oidc-login',
      w: 600,
      h: 700,
    });

    return this.pollLoginState();
  }

  private async pollLoginState(): Promise<void> {
    const executePoll = async (
      resolve: () => void,
      reject: (e: Error) => void
    ) => {
      try {
        if (!this.popup) {
          throw new Error('Unable to poll when popup is not initialized.');
        }

        const response = await fetch('/api/v1/auth/me');

        if (response.ok) {
          this.closePopup();
          resolve();
        } else if (!response.ok && !this.popup?.closed) {
          setTimeout(executePoll, 1000, resolve, reject);
        } else {
          reject(new Error('Popup closed without completing login'));
        }
      } catch (e) {
        this.closePopup();
        reject(e);
      }
    };

    return new Promise(executePoll);
  }
}

export default OIDCAuth;
