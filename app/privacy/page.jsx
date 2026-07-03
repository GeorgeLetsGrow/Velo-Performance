import LegalLayout from '../legal/LegalLayout';

export const metadata = {
  title: 'Privacy Policy — Velo Performance Lab',
  description: 'How Velo Performance Lab collects, uses, and protects your information.',
};

export default function PrivacyPolicy() {
  return (
    <LegalLayout eyebrow="Legal" title="Privacy Policy" updated="July 2026">
      <p>
        Velo Performance Lab (&ldquo;Velo,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) operates an
        after-school baseball and softball training program in Apollo Beach, FL. This
        page explains what information we collect through our website, why we collect
        it, and how it&apos;s used.
      </p>

      <h2>Information We Collect</h2>
      <p>When you submit our contact form or book a session, we collect:</p>
      <ul>
        <li><strong>Contact information</strong> — your name, email address, and/or phone number.</li>
        <li><strong>Athlete information</strong> — your athlete&apos;s name, age, and sport, so we can prepare for their session.</li>
        <li><strong>Booking details</strong> — the pass or training session selected, and the dates/times chosen.</li>
        <li><strong>Payment information</strong> — when you book a paid session, payment is processed entirely by Stripe. We never see or store your card number; we only receive confirmation that payment succeeded.</li>
      </ul>

      <h2>How We Use Your Information</h2>
      <p>We use the information you provide solely to:</p>
      <ul>
        <li>Respond to inquiries submitted through our contact form.</li>
        <li>Schedule, confirm, and manage training sessions and passes.</li>
        <li>Notify our staff when a new inquiry or booking comes in.</li>
        <li>Send you text messages about your own booking, but only if you&apos;ve checked the opt-in box to consent to that. See &ldquo;Text Messages (SMS)&rdquo; below.</li>
      </ul>
      <p>We do not sell, rent, or share your information with third parties for marketing purposes.</p>

      <h2>Text Messages (SMS)</h2>
      <p>
        Our contact and booking forms include an unchecked, optional checkbox to
        consent to receive text messages about your reservation. Checking this box is
        never required to submit a form or complete a booking. If you opt in:
      </p>
      <ul>
        <li>Message and data rates may apply.</li>
        <li>You can reply <strong>STOP</strong> at any time to opt out.</li>
        <li>We only send messages related to your own booking — never marketing or promotional texts.</li>
      </ul>

      <h2>Who We Share Data With</h2>
      <p>We use a small number of service providers to run the site and business, each of whom only receives the data needed to do their job:</p>
      <ul>
        <li><strong>Netlify</strong> — hosts our website and processes contact form submissions.</li>
        <li><strong>Supabase</strong> — stores booking records securely.</li>
        <li><strong>Stripe</strong> — processes payments; handles all card data directly.</li>
        <li><strong>Twilio</strong> — delivers text message notifications.</li>
      </ul>

      <h2>Data Retention</h2>
      <p>
        We keep booking and contact records for as long as needed to run our program
        and meet standard business and tax record-keeping obligations. You can request
        that we delete your information at any time by contacting us below.
      </p>

      <h2>Your Choices</h2>
      <ul>
        <li>You can decline to provide a phone number — email works for all site features except text notifications.</li>
        <li>You can opt out of text messages anytime by replying STOP, or by asking us directly.</li>
        <li>You can request a copy of, correction to, or deletion of your information by contacting us.</li>
      </ul>

      <h2>Children&apos;s Information</h2>
      <p>
        Our program serves youth athletes, but our website is intended for use by
        parents and guardians, who provide their athlete&apos;s information on the
        athlete&apos;s behalf. We do not knowingly collect information directly from
        children.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        If we make material changes to this policy, we&apos;ll update the date at the
        top of this page.
      </p>

      <h2>Contact Us</h2>
      <p>
        Questions about this policy or your information? Reach out through our{' '}
        <a href="/#register">contact form</a>.
      </p>
    </LegalLayout>
  );
}
