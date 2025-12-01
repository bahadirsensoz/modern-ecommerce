import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
})

export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: `"MYSHOP Support" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html,
  })
}

// Email Templates
const createOrderConfirmationTemplate = (orderData: any, customerName: string) => {
  const itemsHtml = orderData.orderItems.map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <div style="display: flex; align-items: center;">
          <img src="${item.product.image}" alt="${item.product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 12px;">
          <div>
            <div style="font-weight: 600; color: #333;">${item.product.name}</div>
            <div style="color: #666; font-size: 14px;">
              Quantity: ${item.quantity}
              ${item.size ? `| Size: ${item.size}` : ''}
              ${item.color ? `| Color: ${item.color}` : ''}
            </div>
          </div>
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Order Confirmed!</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Thank you for your purchase</p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0;">Hello ${customerName},</h2>
        <p>Your order has been successfully placed and is being processed. Here are your order details:</p>
      </div>

      <div style="background: white; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
        <div style="background: #f8f9fa; padding: 15px; border-bottom: 1px solid #ddd;">
          <h3 style="margin: 0; color: #333;">Order #${orderData._id}</h3>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Placed on ${new Date(orderData.createdAt).toLocaleDateString()}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Item</th>
              <th style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #333;">Order Summary</h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Subtotal:</span>
          <span>$${orderData.subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Tax:</span>
          <span>$${orderData.tax.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Shipping:</span>
          <span>$${orderData.shipping.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 18px; border-top: 2px solid #ddd; padding-top: 8px;">
          <span>Total:</span>
          <span>$${orderData.totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #2d5a2d;">Shipping Address</h3>
        <p style="margin: 0; color: #2d5a2d;">
          ${orderData.shippingAddress.fullName}<br>
          ${orderData.shippingAddress.address}<br>
          ${orderData.shippingAddress.city}, ${orderData.shippingAddress.postalCode}<br>
          ${orderData.shippingAddress.country}
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL}/orders/${orderData._id}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
          View Order Details
        </a>
      </div>

      <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
        <p>If you have any questions, please contact our support team.</p>
        <p>Thank you for choosing MYSHOP!</p>
      </div>
    </body>
    </html>
  `
}

const createNewsletterSignupTemplate = (email: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Newsletter Subscription</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">📧 Welcome to MYSHOP!</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">You're now subscribed to our newsletter</p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0;">Thank you for subscribing!</h2>
        <p>We're excited to have you as part of our community. You'll now receive:</p>
        <ul style="color: #555;">
          <li>Exclusive offers and discounts</li>
          <li>New product announcements</li>
          <li>Fashion tips and trends</li>
          <li>Early access to sales</li>
        </ul>
      </div>

      <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #2d5a2d;">What's Next?</h3>
        <p style="margin: 0; color: #2d5a2d;">
          Keep an eye on your inbox for our next newsletter. We promise to only send you valuable content and never spam!
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
          Continue Shopping
        </a>
      </div>

      <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
        <p>If you wish to unsubscribe, you can do so at any time by clicking the unsubscribe link in our emails.</p>
        <p>Thank you for choosing MYSHOP!</p>
      </div>
    </body>
    </html>
  `
}

const createOrderStatusUpdateTemplate = (orderData: any, customerName: string, newStatus: string) => {
  const statusEmojis: { [key: string]: string } = {
    'processing': '⚙️',
    'shipped': '📦',
    'delivered': '✅',
    'cancelled': '❌'
  }

  const statusMessages: { [key: string]: string } = {
    'processing': 'Your order is being prepared for shipment',
    'shipped': 'Your order has been shipped and is on its way',
    'delivered': 'Your order has been delivered successfully',
    'cancelled': 'Your order has been cancelled'
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Status Update</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">${statusEmojis[newStatus] || '📋'} Order Status Updated</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">${statusMessages[newStatus] || 'Your order status has been updated'}</p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0;">Hello ${customerName},</h2>
        <p>Your order status has been updated. Here are the details:</p>
      </div>

      <div style="background: white; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
        <div style="background: #f8f9fa; padding: 15px; border-bottom: 1px solid #ddd;">
          <h3 style="margin: 0; color: #333;">Order #${orderData._id}</h3>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Updated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div style="padding: 20px;">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <span style="font-size: 24px; margin-right: 10px;">${statusEmojis[newStatus] || '📋'}</span>
            <div>
              <div style="font-weight: 600; color: #333; text-transform: capitalize;">Status: ${newStatus}</div>
              <div style="color: #666; font-size: 14px;">${statusMessages[newStatus] || 'Your order status has been updated'}</div>
            </div>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL}/orders/${orderData._id}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
          View Order Details
        </a>
      </div>

      <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
        <p>If you have any questions about your order, please contact our support team.</p>
        <p>Thank you for choosing MYSHOP!</p>
      </div>
    </body>
    </html>
  `
}

// Email Service Functions
export const sendOrderConfirmationEmail = async (orderData: any, customerEmail: string, customerName: string) => {
  try {
    const html = createOrderConfirmationTemplate(orderData, customerName)
    await sendEmail(customerEmail, `Order Confirmation - #${orderData._id}`, html)
  } catch (error) {
    console.error('Failed to send order confirmation email:', error)
  }
}

export const sendNewsletterSignupEmail = async (email: string) => {
  try {
    const html = createNewsletterSignupTemplate(email)
    await sendEmail(email, 'Welcome to MYSHOP Newsletter!', html)
  } catch (error) {
    console.error('Failed to send newsletter signup email:', error)
  }
}

export const sendOrderStatusUpdateEmail = async (orderData: any, customerEmail: string, customerName: string, newStatus: string) => {
  try {
    const html = createOrderStatusUpdateTemplate(orderData, customerName, newStatus)
    await sendEmail(customerEmail, `Order Status Update - #${orderData._id}`, html)
  } catch (error) {
    console.error('Failed to send order status update email:', error)
  }
}
