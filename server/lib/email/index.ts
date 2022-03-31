import nodemailer from 'nodemailer';
import Email from 'email-templates';
import { getSettings } from '../settings';
class PreparedEmail extends Email {
  public constructor() {
    const settings = getSettings().notifications.agents.email;

    const transport = nodemailer.createTransport({
      host: settings.options.smtpHost,
      port: settings.options.smtpPort,
      secure: settings.options.secure,
      tls: settings.options.allowSelfSigned
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
      auth:
        settings.options.authUser && settings.options.authPass
          ? {
              user: settings.options.authUser,
              pass: settings.options.authPass,
            }
          : undefined,
    });
    super({
      message: {
        from: {
          name: settings.options.senderName,
          address: settings.options.emailFrom,
        },
      },
      send: true,
      transport: transport,
    });
  }
}

export default PreparedEmail;
