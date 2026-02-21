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
     */
    public async generateAndSendOtp(identifier: string): Promise<boolean> {
        // Generate a random 4-digit code
        const code = Math.floor(1000 + Math.random() * 9000).toString();

        // Calculate expiration
        const expirationMinutes = parseInt(process.env.OTP_EXPIRATION_MINUTES || '5', 10);
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

        // Save to DB
        await this.otpRepository.createOtp(identifier, code, expiresAt);

        // Send Email
        const htmlBody = this.notificationService.getOtpEmailTemplate(code, expirationMinutes);
        const subject = 'Tu código de verificación - Koneksi';

        const isSent = await this.notificationService.sendEmail(identifier, subject, htmlBody);

        return isSent;
    }

    /**
     * Validates an OTP against the database records.
     */
    public async validateOtp(identifier: string, code: string): Promise<boolean> {
        const validOtp = await this.otpRepository.findValidOtp(identifier, code);

        if (!validOtp) {
            return false;
        }

        // Mark as used
        await this.otpRepository.markAsVerified(validOtp.id);

        return true;
    }
}
