# GoldVault Conversion Tracking & Analytics Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing conversion tracking, analytics pixels, and lead capture systems across all marketing channels. These systems will enable real-time monitoring of campaign performance, user behavior, and ROI.

## 1. Google Analytics 4 (GA4) Setup

### 1.1 Installation

Google Analytics 4 is the primary analytics platform for tracking user behavior, conversions, and campaign performance.

**Step 1: Create GA4 Property**
*   Go to [Google Analytics](https://analytics.google.com/)
*   Create a new GA4 property for GoldVault
*   Generate the Measurement ID (format: G-XXXXXXXXXX)

**Step 2: Add GA4 Tag to Website**

Add the following code snippet to your website's `<head>` section (already included in the Manus template):

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

### 1.2 Key Events to Track

Configure the following conversion events in GA4:

| Event Name | Trigger | Value |
| :--- | :--- | :--- |
| sign_up | User completes registration | N/A |
| view_platform | User views platform features | N/A |
| view_pricing | User views pricing page | N/A |
| add_to_cart | User initiates deposit | Transaction amount |
| purchase | User completes deposit | Transaction amount |
| demo_request | User requests a demo | N/A |
| contact_form_submit | User submits contact form | N/A |
| ai_chat_start | User opens AI chat | N/A |
| view_item | User views specific feature | Feature name |

### 1.3 Implement Event Tracking in React

Add event tracking to your React components:

```typescript
import { useEffect } from 'react';

export function trackEvent(eventName: string, eventData?: Record<string, any>) {
  if (window.gtag) {
    window.gtag('event', eventName, eventData);
  }
}

// Example usage in a component:
function SignUpButton() {
  const handleSignUp = () => {
    trackEvent('sign_up', {
      method: 'email',
      user_type: 'new'
    });
    // Proceed with sign-up logic
  };

  return <button onClick={handleSignUp}>Sign Up</button>;
}
```

## 2. Facebook Pixel Setup

### 2.1 Installation

The Facebook Pixel tracks user actions across your website and enables retargeting on Facebook and Instagram.

**Step 1: Create Facebook Pixel**
*   Go to [Facebook Business Suite](https://business.facebook.com/)
*   Navigate to Data Sources → Pixels
*   Create a new pixel and copy the Pixel ID

**Step 2: Add Facebook Pixel to Website**

Add the following code to your website's `<head>` section:

```html
<!-- Facebook Pixel -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR_PIXEL_ID_HERE');
  fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID_HERE&ev=PageView&noscript=1"
/></noscript>
```

Replace `YOUR_PIXEL_ID_HERE` with your actual Pixel ID.

### 2.2 Key Events to Track

Configure these standard Facebook Pixel events:

| Event | Trigger | Value |
| :--- | :--- | :--- |
| ViewContent | User views platform | N/A |
| AddToCart | User initiates deposit | Transaction amount |
| Purchase | User completes deposit | Transaction amount |
| Lead | User requests demo | N/A |
| CompleteRegistration | User signs up | N/A |

### 2.3 Implement Custom Events

```typescript
export function trackFacebookEvent(eventName: string, eventData?: Record<string, any>) {
  if (window.fbq) {
    window.fbq('track', eventName, eventData);
  }
}

// Example:
function DepositButton() {
  const handleDeposit = (amount: number) => {
    trackFacebookEvent('Purchase', {
      value: amount,
      currency: 'USD',
      content_name: 'Gold Deposit'
    });
  };

  return <button onClick={() => handleDeposit(1000)}>Deposit $1000</button>;
}
```

## 3. TikTok Pixel Setup

### 3.1 Installation

The TikTok Pixel enables conversion tracking and retargeting on TikTok.

**Step 1: Create TikTok Pixel**
*   Go to [TikTok Ads Manager](https://ads.tiktok.com/)
*   Navigate to Assets → Pixels
*   Create a new pixel and copy the Pixel ID

**Step 2: Add TikTok Pixel to Website**

```html
<!-- TikTok Pixel -->
<script>
  !function (w, d, t) {
    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<e.length;n++)e[n]&&e[n].apply(window,[]);},ttq.track=function(e){ttq.push([e])},ttq.pageView=function(){ttq.push(["pageView"])},ttq._i={},ttq._t={},ttq._x=[],ttq.push=function(e){ttq._x.push(e)},ttq.loadScript=function(e,n){if(!document.getElementById(n)){var i=document.createElement("script");i.type="text/javascript",i.id=n,i.src=e,i.onload=function(){ttq.pageView(),ttq.track("CompleteRegistration")},document.head.appendChild(i)}};
    ttq.loadScript("https://analytics.tiktok.com/i18n/pixel/events.js","tiktok-pixel");
    ttq.instance("YOUR_PIXEL_ID_HERE");
  }(window, document, "ttq");
</script>
```

Replace `YOUR_PIXEL_ID_HERE` with your TikTok Pixel ID.

## 4. Lead Capture & Email Automation

### 4.1 Lead Capture Form

Implement a lead capture form on your website to collect user information:

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function LeadCaptureForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track event
    trackEvent('lead_form_submit', {
      email: email,
      name: name
    });
    
    // Send to backend/CRM
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      
      if (response.ok) {
        setSubmitted(true);
        // Send to email automation service
        await sendWelcomeEmail(email, name);
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
    }
  };

  if (submitted) {
    return (
      <Card className="p-6 bg-green-500/10 border-green-500/30">
        <p className="text-green-400">Thank you! Check your email for next steps.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-slate-800/50 border-slate-700/50">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
        />
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
        />
        <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600">
          Get Started Free
        </Button>
      </form>
    </Card>
  );
}
```

### 4.2 Email Automation Integration

Integrate with email automation services like Mailchimp, ConvertKit, or HubSpot:

```typescript
async function sendWelcomeEmail(email: string, name: string) {
  const response = await fetch('/api/email/welcome', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      name,
      timestamp: new Date().toISOString()
    })
  });
  
  return response.json();
}
```

## 5. UTM Parameter Strategy

Use UTM parameters to track campaign sources and performance:

**Format:** `https://goldvault.com?utm_source=SOURCE&utm_medium=MEDIUM&utm_campaign=CAMPAIGN&utm_content=CONTENT`

**Examples:**

*   Google Search: `?utm_source=google&utm_medium=cpc&utm_campaign=gold_investment`
*   Facebook: `?utm_source=facebook&utm_medium=social&utm_campaign=defi_yield`
*   TikTok: `?utm_source=tiktok&utm_medium=social&utm_campaign=gen_z_gold`
*   YouTube: `?utm_source=youtube&utm_medium=video&utm_campaign=explainer_series`

## 6. Conversion Tracking Dashboard

Create a dashboard to monitor key metrics:

| Metric | Target | Frequency |
| :--- | :--- | :--- |
| Sign-ups | 100/day | Daily |
| Demo Requests | 20/day | Daily |
| Deposit Conversions | 10% of sign-ups | Weekly |
| Average Deposit | $1,000 | Weekly |
| Customer Acquisition Cost (CAC) | <$50 | Weekly |
| Return on Ad Spend (ROAS) | >3x | Weekly |

## 7. Privacy & Compliance

*   Ensure all tracking complies with GDPR, CCPA, and other privacy regulations.
*   Implement cookie consent management (e.g., Cookiebot, OneTrust).
*   Provide clear privacy policies and opt-out mechanisms.
*   Use server-side tracking where possible to reduce reliance on third-party cookies.

## 8. Testing & Validation

Before going live, test all tracking implementations:

*   Use browser developer tools to verify pixel firing.
*   Test GA4 events in real-time.
*   Verify Facebook and TikTok pixel events are recorded.
*   Confirm email automation triggers correctly.

## 9. Ongoing Optimization

*   Monitor conversion rates weekly and identify underperforming channels.
*   A/B test ad copy, landing pages, and CTAs.
*   Refine audience targeting based on conversion data.
*   Continuously improve the user experience based on behavioral insights.

This comprehensive tracking setup ensures complete visibility into campaign performance and user behavior, enabling data-driven optimization and maximizing ROI across all marketing channels.
