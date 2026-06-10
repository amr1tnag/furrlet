export async function sendOtpSms({ phone, otp }: { phone: string; otp: string }) {
  const apiKey = process.env.FAST2SMS_API_KEY
  if (!apiKey) throw new Error('FAST2SMS_API_KEY is not configured')

  const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route: 'otp',
      variables_values: otp,
      numbers: phone.replace(/\D/g, '').slice(-10), // strip country code, keep 10 digits
    }),
  })

  const data = await res.json()
  if (!data.return) throw new Error(data.message || 'SMS failed to send')
}
