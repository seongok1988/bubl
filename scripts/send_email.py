# 결과 이메일 발송 예시 (SendGrid)
import sys
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

if __name__ == '__main__':
    result_file = sys.argv[1]
    with open(result_file, 'r', encoding='utf-8') as f:
        content = f.read()
    message = Mail(
        from_email='admin@example.com',
        to_emails='ceo@example.com',
        subject='Go-Live Validation Result',
        plain_text_content=content
    )
    sg = SendGridAPIClient('SENDGRID_API_KEY')
    response = sg.send(message)
    print(response.status_code)