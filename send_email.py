import os
import sys
import pickle
import base64
import json
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def authenticate_gmail():
    """Authenticate and create the Gmail API service."""
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
        print(f'An error occurred: {error}')

def create_message(sender, to, subject, body):
    """Create a message for an email."""
    message = MIMEMultipart()
    message['to'] = to
    message['from'] = sender
    message['subject'] = subject

    msg = MIMEText(body)
    message.attach(msg)

    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
    return {'raw': raw_message}

def send_email(service, sender, to, subject, body):
    """Send an email using the Gmail API."""
    try:
        message = create_message(sender, to, subject, body)
        message_sent = service.users().messages().send(userId="me", body=message).execute()
        print(f"Message sent successfully! Message ID: {message_sent['id']}")
    except HttpError as error:
        print(f"An error occurred while sending the message: {error}")

if __name__ == '__main__':
    # Get donor info from Node.js
    donor_email = sys.argv[1]
    donor_name = sys.argv[2]
    amount = sys.argv[3]

    sender = "flowst8funds@gmail.com"
    subject = "Thank You for Your Donation!"
    body = f"""Dear {donor_name},

    Thank you for your generous donation of ${amount}! Your support helps us continue our efforts, and we are grateful for your contribution.

    Best regards,  
    Flowst8 Team
    """

    # Authenticate Gmail API
    service = authenticate_gmail()
    if service:
        send_email(service, sender, donor_email, subject, body)

