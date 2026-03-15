export class NotificationService {
    /**
     * Obtains the Auth Token required to send notifications
     */
    private async getAuthToken(): Promise<string> {
        const authUrl = process.env.NOTIFICATION_AUTH_URL;
        const authUser = process.env.NOTIFICATION_AUTH_USER;
        const authPass = process.env.NOTIFICATION_AUTH_PASS;

        if (!authUrl || !authUser || !authPass) {
            throw new Error('Notification Service configuration is missing in .env');
        }

        // Encode the username and password to Base64 for Basic Auth
        const basicAuthHash = Buffer.from(`${authUser}:${authPass}`).toString('base64');

        const response = await fetch(authUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${basicAuthHash}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error fetching notification token:', response.status, errorText);
            throw new Error('Failed to obtain notification auth token');
        }

        const data = await response.json() as { access_token: string };
        return data.access_token;
    }

    /**
     * Sends an email using the external notification service
     */
    public async sendEmail(toAddress: string, subject: string, htmlBody: string): Promise<boolean> {
        try {
            const token = await this.getAuthToken();
            const sendUrl = process.env.NOTIFICATION_SEND_URL;

            if (!sendUrl) {
                throw new Error('NOTIFICATION_SEND_URL is missing in .env');
            }

            const response = await fetch(sendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    subject: subject,
                    body: htmlBody,
                    addresses: [toAddress]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error sending email:', response.status, errorText);
                return false;
            }

            console.log(`[NotificationService] Email sent successfully to ${toAddress}`);
            return true;
        } catch (error) {
            console.error('[NotificationService] Unexpected error sending email', error);
            return false;
        }
    }

    /**
     * Renders a visually appealing HTML for OTP
     */
    public getOtpEmailTemplate(otpCode: string, validityMinutes: number): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Inter', Arial, sans-serif; background-color: #f4f4f7; color: #333; margin: 0; padding: 20px; }
                .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 30px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                .logo { font-size: 24px; font-weight: bold; color: #6D28D9; margin-bottom: 20px; }
                .title { font-size: 20px; color: #111827; margin-bottom: 10px; }
                .message { font-size: 15px; color: #4B5563; line-height: 1.5; margin-bottom: 30px; }
                .otp-box { background-color: #F3E8FF; border: 2px dashed #8B5CF6; border-radius: 8px; padding: 15px; margin: 20px 0; }
                .otp-code { font-size: 32px; font-weight: 800; color: #6D28D9; letter-spacing: 4px; }
                .footer { font-size: 12px; color: #9CA3AF; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">Koneksi</div>
                <h1 class="title">Verificación de Correo Electrónico</h1>
                <p class="message">
                    Hola,<br/><br/>
                    Has solicitado verificar tu correo electrónico para continuar con tu enrolamiento médico. Utiliza el siguiente código para completar este paso:
                </p>
                <div class="otp-box">
                    <span class="otp-code">${otpCode}</span>
                </div>
                <p class="message" style="font-size: 13px;">
                    Este código expirará en <strong>${validityMinutes} minutos</strong>. Si no solicitaste este código, por favor ignora este correo.
                </p>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Koneksi. Todos los derechos reservados.
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Renders a visually appealing HTML for Backoffice Login OTP
     */
    public getBackofficeOtpEmailTemplate(otpCode: string, validityMinutes: number): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Inter', Arial, sans-serif; background-color: #f4f4f7; color: #333; margin: 0; padding: 20px; }
                .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 30px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                .logo { font-size: 24px; font-weight: bold; color: #6D28D9; margin-bottom: 20px; }
                .title { font-size: 20px; color: #111827; margin-bottom: 10px; }
                .message { font-size: 15px; color: #4B5563; line-height: 1.5; margin-bottom: 30px; }
                .otp-box { background-color: #F3E8FF; border: 2px dashed #8B5CF6; border-radius: 8px; padding: 15px; margin: 20px 0; }
                .otp-code { font-size: 32px; font-weight: 800; color: #6D28D9; letter-spacing: 4px; }
                .footer { font-size: 12px; color: #9CA3AF; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">Koneksi Backoffice</div>
                <h1 class="title">Acceso al Sistema</h1>
                <p class="message">
                    Hola,<br/><br/>
                    Se ha solicitado acceso al panel de administración (Backoffice) de Koneksi con esta dirección de correo. Utiliza el siguiente código para iniciar sesión con seguridad:
                </p>
                <div class="otp-box">
                    <span class="otp-code">${otpCode}</span>
                </div>
                <p class="message" style="font-size: 13px;">
                    Este código es válido por <strong>${validityMinutes} minutos</strong>. Si no intentaste iniciar sesión en el sistema, es seguro ignorar este correo.
                </p>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Koneksi. Todos los derechos reservados.
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Renders a visually appealing HTML for Enrollment Success with Tracking QR
     */
    public getEnrollmentSuccessEmailTemplate(doctorName: string, trackingUuid: string, frontendUrl: string): string {
        const trackingUrl = `${frontendUrl}/doctor-enrollment-status/${trackingUuid}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(trackingUrl)}`;

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Inter', Arial, sans-serif; background-color: #f4f4f7; color: #333; margin: 0; padding: 20px; }
                .container { max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 30px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                .logo { font-size: 24px; font-weight: bold; color: #6D28D9; margin-bottom: 20px; }
                .title { font-size: 20px; color: #111827; margin-bottom: 10px; }
                .message { font-size: 15px; color: #4B5563; line-height: 1.6; margin-bottom: 20px; text-align: left; }
                .button { display: inline-block; background-color: #6D28D9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-bottom: 25px; }
                .qr-container { background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; margin: 20px auto; width: fit-content; }
                .qr-image { width: 150px; height: 150px; }
                .footer { font-size: 12px; color: #9CA3AF; margin-top: 30px; border-top: 1px solid #E5E7EB; padding-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">Koneksi</div>
                <h1 class="title">¡Solicitud de Enrolamiento Recibida!</h1>
                
                <p class="message">
                    Hola Dr(a). <strong>${doctorName}</strong>,<br/><br/>
                    Hemos recibido correctamente su solicitud de enrolamiento médico en la plataforma Koneksi. Nuestro equipo de credenciales ya ha iniciado el proceso de validación.
                </p>

                <p class="message" style="text-align: center;">
                    Puede consultar el estado de su solicitud en cualquier momento escaneando el siguiente código QR o haciendo clic en el botón inferior:
                </p>

                <div class="qr-container">
                    <img src="${qrCodeUrl}" alt="QR Code" class="qr-image" />
                    <div style="font-size: 11px; color: #64748B; margin-top: 8px;">ID: ${trackingUuid.split('-')[0]}***</div>
                </div>

                <a href="${trackingUrl}" class="button">Consultar Estado de Solicitud</a>

                <p class="message" style="font-size: 13px; text-align: center;">
                    Si no puede hacer clic en el botón, copie y pegue esta dirección en su navegador:<br/>
                    <a href="${trackingUrl}" style="color: #6D28D9; word-break: break-all;">${trackingUrl}</a>
                </p>

                <div class="footer">
                    Este es un mensaje automático, por favor no responda a este correo.<br/>
                    &copy; ${new Date().getFullYear()} Koneksi. Todos los derechos reservados.
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Renders a visually appealing HTML for Evaluation Approved
     */
    public getEvaluationApprovedEmailTemplate(doctorName: string): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Inter', Arial, sans-serif; background-color: #f4f4f7; color: #333; margin: 0; padding: 20px; }
                .container { max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 30px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                .logo { font-size: 24px; font-weight: bold; color: #6D28D9; margin-bottom: 20px; }
                .title { font-size: 20px; color: #16a34a; margin-bottom: 10px; }
                .message { font-size: 15px; color: #4B5563; line-height: 1.6; margin-bottom: 20px; text-align: left; }
                .footer { font-size: 12px; color: #9CA3AF; margin-top: 30px; border-top: 1px solid #E5E7EB; padding-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">Koneksi</div>
                <h1 class="title">¡Alta Médica Aprobada!</h1>
                <p class="message">
                    Hola Dr(a). <strong>${doctorName}</strong>,<br/><br/>
                    Nos complace informarle que su solicitud de enrolamiento ha sido <strong>aprobada exitosamente</strong> por nuestro equipo de revisión.
                    <br/><br/>
                    Próximamente estaremos enviando un correo con sus credenciales e instrucciones de acceso al portal médico. ¡Bienvenido a Koneksi!
                </p>
                <div class="footer">
                    Este es un mensaje automático, por favor no responda a este correo.<br/>
                    &copy; ${new Date().getFullYear()} Koneksi. Todos los derechos reservados.
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Renders a visually appealing HTML for Evaluation Observed
     */
    public getEvaluationObservedEmailTemplate(doctorName: string, reasonDescription: string, notes: string, trackingUuid: string, frontendUrl: string): string {
        const trackingUrl = `${frontendUrl}/doctor-enrollment-status/${trackingUuid}`;
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Inter', Arial, sans-serif; background-color: #f4f4f7; color: #333; margin: 0; padding: 20px; }
                .container { max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 30px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                .logo { font-size: 24px; font-weight: bold; color: #6D28D9; margin-bottom: 20px; }
                .title { font-size: 20px; color: #d97706; margin-bottom: 10px; }
                .message { font-size: 15px; color: #4B5563; line-height: 1.6; margin-bottom: 15px; text-align: left; }
                .box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; text-align: left; border-radius: 4px; }
                .button { display: inline-block; background-color: #6D28D9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 25px 0; }
                .footer { font-size: 12px; color: #9CA3AF; margin-top: 30px; border-top: 1px solid #E5E7EB; padding-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">Koneksi</div>
                <h1 class="title">Observación en su Solicitud</h1>
                <p class="message">
                    Hola Dr(a). <strong>${doctorName}</strong>,<br/><br/>
                    Nuestro equipo ha revisado su solicitud de enrolamiento pero requiere un ajuste antes de poder ser aprobada.
                </p>
                <div class="box">
                    <p style="margin-top:0;"><strong>Motivo:</strong> ${reasonDescription}</p>
                    ${notes ? `<p style="margin-bottom:0;"><strong>Notas:</strong> ${notes}</p>` : ''}
                </div>
                <p class="message">
                    Por favor, ingrese al portal mediante el siguiente botón para ajustar su solicitud y continuar con el proceso.
                </p>
                <a href="${trackingUrl}" class="button">Ajustar mi Solicitud</a>
                <div class="footer">
                    Este es un mensaje automático, por favor no responda a este correo.<br/>
                    &copy; ${new Date().getFullYear()} Koneksi. Todos los derechos reservados.
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Renders a visually appealing HTML for Evaluation Rejected
     */
    public getEvaluationRejectedEmailTemplate(doctorName: string, reasonDescription: string, notes: string): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Inter', Arial, sans-serif; background-color: #f4f4f7; color: #333; margin: 0; padding: 20px; }
                .container { max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 30px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                .logo { font-size: 24px; font-weight: bold; color: #6D28D9; margin-bottom: 20px; }
                .title { font-size: 20px; color: #dc2626; margin-bottom: 10px; }
                .message { font-size: 15px; color: #4B5563; line-height: 1.6; margin-bottom: 15px; text-align: left; }
                .box { background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; text-align: left; border-radius: 4px; }
                .footer { font-size: 12px; color: #9CA3AF; margin-top: 30px; border-top: 1px solid #E5E7EB; padding-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">Koneksi</div>
                <h1 class="title">Solicitud de Enrolamiento Rechazada</h1>
                <p class="message">
                    Hola Dr(a). <strong>${doctorName}</strong>,<br/><br/>
                    Lamentamos informarle que su solicitud de enrolamiento ha sido rechazada debido a que no cumple con los requisitos mínimos de nuestro proceso de credencialización.
                </p>
                <div class="box">
                    <p style="margin-top:0;"><strong>Motivo:</strong> ${reasonDescription}</p>
                    ${notes ? `<p style="margin-bottom:0;"><strong>Notas Adicionales:</strong> ${notes}</p>` : ''}
                </div>
                <div class="footer">
                    Este es un mensaje automático, por favor no responda a este correo.<br/>
                    &copy; ${new Date().getFullYear()} Koneksi. Todos los derechos reservados.
                </div>
            </div>
        </body>
        </html>
        `;
    }
}
