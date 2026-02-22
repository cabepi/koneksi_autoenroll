import { OtpRepository } from '../data/repositories/OtpRepository.js';
import { NotificationService } from './NotificationService.js';

export class OtpService {
    private otpRepository: OtpRepository;
    private notificationService: NotificationService;

    constructor() {
        this.otpRepository = new OtpRepository();
        this.notificationService = new NotificationService();
    }

    /**
     * Generates a 4-digit OTP, saves it to the database, and sends it via email.
     * Returns the UUID of the generated OTP if successful, otherwise null.
     */
    public async generateAndSendOtp(identifier: string, context: 'enrollment' | 'backoffice' = 'enrollment'): Promise<string | null> {
        // Generate a random 4-digit code
        const code = Math.floor(1000 + Math.random() * 9000).toString();

        // Calculate expiration
        const expirationMinutes = parseInt(process.env.OTP_EXPIRATION_MINUTES || '5', 10);
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

        // Save to DB
        const newOtp = await this.otpRepository.createOtp(identifier, code, expiresAt);

        // Send Email
        const htmlBody = context === 'backoffice'
            ? this.notificationService.getBackofficeOtpEmailTemplate(code, expirationMinutes)
            : this.notificationService.getOtpEmailTemplate(code, expirationMinutes);

        const subject = context === 'backoffice'
            ? 'Acceso Seguro: Tu código de Koneksi Backoffice'
            : 'Tu código de verificación - Koneksi';

        const isSent = await this.notificationService.sendEmail(identifier, subject, htmlBody);

        return isSent ? newOtp.id : null;
    }

    /**
     * Validates an OTP against the database records using its unique ID.
     */
    public async validateOtp(id: string, code: string): Promise<boolean> {
        const validOtp = await this.otpRepository.findValidOtp(id, code);

        if (!validOtp) {
            return false;
        }

        // Mark as used
        await this.otpRepository.markAsVerified(validOtp.id);

        return true;
    }
}
