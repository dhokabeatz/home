# Email Setup Guide for Contact Form

This guide will help you configure email sending for the contact form functionality.

## Quick Setup (Gmail)

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Generate App Password

1. In Google Account Security settings
2. Go to "2-Step Verification"
3. Scroll down to "App passwords"
4. Select "Mail" and generate a password
5. Copy the 16-character app password

### Step 3: Update Environment Variables

Update your `backend/.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-actual-email@gmail.com
SMTP_PASS=your-16-character-app-password
PORTFOLIO_EMAIL=your-actual-email@gmail.com
```

## Testing

1. Start the backend server:

```bash
cd backend
npm run start:dev
```

2. Start the frontend:

```bash
cd frontend
npm run dev
```

3. Navigate to the contact section and submit a test message

## Features

✅ **Contact Form Submission**: Stores messages in database  
✅ **Email Notification**: Sends email to you when someone submits the form  
✅ **Auto-Reply**: Sends thank you email to the person who contacted you  
✅ **Error Handling**: Form submission works even if email fails  
✅ **Beautiful Email Template**: Professional HTML email templates

## Email Templates

### Notification Email (to you)

- Contact details (name, email, phone)
- Full message content
- Quick action links (reply, call)
- Professional formatting

### Auto-Reply Email (to submitter)

- Thank you message
- Response time expectation
- Your contact information
- Social media links

## Other Email Providers

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Custom SMTP Server

```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
```

## Security Notes

⚠️ **Never commit your actual email credentials to version control**  
⚠️ **Use app passwords instead of your regular password**  
⚠️ **Keep your `.env` file in `.gitignore`**

## Customization

You can customize the email templates by editing:

- `backend/src/common/email/email.service.ts`
- Update the HTML templates in `sendContactEmail()` and `sendAutoReply()` methods

## Troubleshooting

### "Authentication failed"

- Make sure you're using an app password, not your regular password
- Verify 2-factor authentication is enabled
- Check that SMTP settings are correct

### "Connection refused"

- Check your firewall settings
- Verify SMTP_HOST and SMTP_PORT are correct
- Try with secure: true for port 465

### Emails not being received

- Check spam/junk folder
- Verify PORTFOLIO_EMAIL is set correctly
- Test with a different email address
