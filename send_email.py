import os
import sys
import pickle
import base64
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# ✅ Gmail API scope
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def authenticate_gmail():
    """Authenticate and return Gmail API service."""
    creds = None
    if os.path.exists('token.json'):
        with open('token.json', 'rb') as token:
            creds = pickle.load(token)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=8080)
        with open('token.json', 'wb') as token:
            pickle.dump(creds, token)

    try:
        service = build('gmail', 'v1', credentials=creds)
        return service
    except HttpError as error:
        print(f'❌ Gmail API Error: {error}')
        return None

def create_message(sender, to, subject, body):
    """Create the email message."""
    message = MIMEMultipart()
    message['to'] = to
    message['from'] = sender
    message['subject'] = subject

    msg = MIMEText(body)
    message.attach(msg)

    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
    return {'raw': raw_message}

def send_email(service, sender, to, subject, body):
    """Send the email."""
    try:
        message = create_message(sender, to, subject, body)
        message_sent = service.users().messages().send(userId="me", body=message).execute()
        print(f"Email sent successfully! Message ID: {message_sent['id']}")
    except HttpError as error:
        print(f"❌ Error sending email: {error}")

# ✅ Entry point
if __name__ == '__main__':
    try:
        donor_email = sys.argv[1]
        donor_name = sys.argv[2]
        amount = sys.argv[3]

        sender = "flowst8funds@gmail.com"
        subject = "Thank You for Your Donation!"
        body = f"""Dear {donor_name},

Thank you for your generous donation of ${amount} to Flowst8! 🌟

Your support helps bring real change to those who need it most. We appreciate your kindness and generosity.

With gratitude,  
The Flowst8 Team
"""

        service = authenticate_gmail()
        if service:
            send_email(service, sender, donor_email, subject, body)
        else:
            print("❌ Gmail service authentication failed.")

    except IndexError:
        print("❌ Missing arguments: Usage - python send_email.py <email> <name> <amount>")