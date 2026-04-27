package com.webapp.bankingportal.service;

import java.io.File;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;

import lombok.extern.slf4j.Slf4j;
import lombok.val;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    /**
     * JavaMailSender is OPTIONAL.
     * If mail is not configured (local/dev), app will still start.
     */
    public EmailServiceImpl(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    @Async
    public CompletableFuture<Void> sendEmail(String to, String subject, String text) {
        val future = new CompletableFuture<Void>();

        if (mailSender == null) {
            log.warn("Mail sender not configured. Skipping email to {}", to);
            future.complete(null);
            return future;
        }

        try {
            val message = mailSender.createMimeMessage();
            val helper = new MimeMessageHelper(message, true);

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, true);

            mailSender.send(message);

            log.info("Sent email to {}", to);
            future.complete(null);

        } catch (MessagingException | MailException e) {
            log.error("Failed to send email to {}", to, e);
            future.completeExceptionally(e);
        }

        return future;
    }

    @Override
    public String getLoginEmailTemplate(String name, String loginTime, String loginLocation) {
        return "<div style=\"font-family: Helvetica, Arial, sans-serif; background-color: #f1f1f1; padding: 20px;\">"
                + "<div style=\"max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px;\">"
                + "<h2 style=\"color:#3f51b5;\">OneStopBank</h2>"
                + "<p>Hi " + name + ",</p>"
                + "<p>A login attempt was detected:</p>"
                + "<p><b>Time:</b> " + loginTime + "</p>"
                + "<p><b>Location:</b> " + loginLocation + "</p>"
                + "<p>If this was not you, please reset your password immediately.</p>"
                + "<p>Regards,<br/>OneStopBank Team</p>"
                + "</div></div>";
    }

    @Override
    public String getOtpLoginEmailTemplate(String name, String accountNumber, String otp) {
        return "<div style=\"font-family: Helvetica, Arial, sans-serif; background-color: #f1f1f1; padding: 20px;\">"
                + "<div style=\"max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px;\">"
                + "<h2 style=\"color:#3f51b5;\">OneStopBank</h2>"
                + "<p>Hi " + name + ",</p>"
                + "<p>Account Number: <b>" + accountNumber + "</b></p>"
                + "<p>Your OTP is valid for " + OtpServiceImpl.OTP_EXPIRY_MINUTES + " minutes:</p>"
                + "<h3 style=\"background:#3f51b5;color:#fff;padding:10px;width:max-content;\">"
                + otp + "</h3>"
                + "<p>Regards,<br/>OneStopBank Team</p>"
                + "</div></div>";
    }

    @Override
    public String getBankStatementEmailTemplate(String name, String statementText) {
        return "<div style=\"font-family: Arial, sans-serif; padding: 20px;\">"
                + "<h2>Bank Statement</h2>"
                + "<p>Dear " + name + ",</p>"
                + "<pre style=\"background:#f4f4f4;padding:10px;\">"
                + statementText
                + "</pre>"
                + "<p>Regards,<br/>OneStopBank Team</p>"
                + "</div>";
    }

    @Override
    public void sendEmailWithAttachment(String to, String subject, String text, String attachmentFilePath) {

        if (mailSender == null) {
            log.warn("Mail sender not configured. Skipping attachment email to {}", to);
            return;
        }

        try {
            val message = mailSender.createMimeMessage();
            val helper = new MimeMessageHelper(message, true);

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, true);

            File attachment = new File(attachmentFilePath);
            helper.addAttachment(attachment.getName(), attachment);

            mailSender.send(message);

        } catch (MessagingException e) {
            log.error("Failed to send attachment email to {}", to, e);
        }
    }
}
