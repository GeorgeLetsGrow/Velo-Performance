import LegalLayout from '../legal/LegalLayout';

export const metadata = {
  title: 'Terms & Conditions — Velo Performance Lab',
  description: 'Terms and conditions for booking and training with Velo Performance Lab.',
};

export default function Terms() {
  return (
    <LegalLayout eyebrow="Legal" title="Terms & Conditions" updated="July 2026">
      <p>
        These terms apply to anyone who submits our contact form, books a pass, or
        books an individual training session with Velo Performance Lab
        (&ldquo;Velo,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) in Apollo Beach, FL. By using our
        website or booking a session, you agree to these terms.
      </p>

      <h2>Our Program</h2>
      <p>
        Velo offers an after-school player development program (Drop-In, 3-Day Flex
        Pass, and Unlimited Week passes) and individual 1-on-1 training sessions for
        baseball and softball athletes, Monday through Friday in Apollo Beach, FL.
        Program capacity is limited each day, and individual sessions are booked in
        exclusive time slots.
      </p>

      <h2>Bookings &amp; Payment</h2>
      <ul>
        <li>Passes and individual sessions are paid in full at the time of booking via Stripe.</li>
        <li>Your spot or time slot is reserved once payment is confirmed. A reservation is held for a short window during checkout and released automatically if payment isn&apos;t completed.</li>
        <li>Prices are as listed on our website at the time of booking.</li>
      </ul>

      <h2>Cancellations &amp; Refunds</h2>
      <p>
        We know plans change. If you need to cancel or reschedule, contact us as soon
        as possible through our{' '}
        <a href="/#register">contact form</a> so we can accommodate you or another
        athlete on our waitlist. Refunds are considered on a case-by-case basis at our
        discretion, particularly for cancellations made with little notice.
      </p>

      <h2>Attendance &amp; Conduct</h2>
      <p>
        Athletes and parents/guardians are expected to arrive on time and follow the
        direction of our coaching staff. We reserve the right to remove an athlete
        from a session, without refund, for unsafe or disruptive behavior.
      </p>

      <h2>Assumption of Risk</h2>
      <p>
        Baseball and softball training involve inherent physical risk, including the
        risk of injury. By enrolling an athlete in our program, you acknowledge and
        accept these risks on their behalf.
      </p>

      <h2>Text Message Communications</h2>
      <p>
        If you opt in to receive text messages about your booking, standard message
        and data rates may apply, and you may reply STOP at any time to opt out. See
        our <a href="/privacy">Privacy Policy</a> for details on how we handle your
        information.
      </p>

      <h2>Changes to These Terms</h2>
      <p>
        We may update these terms from time to time. Continued use of our booking
        system after changes are posted means you accept the updated terms.
      </p>

      <h2>Contact Us</h2>
      <p>
        Questions about these terms? Reach out through our{' '}
        <a href="/#register">contact form</a>.
      </p>
    </LegalLayout>
  );
}
