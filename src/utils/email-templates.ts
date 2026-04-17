/**
 * Returns a styled HTML email for address verification.
 */
export function verificationEmailTemplate(url: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 8px;">
      <h2 style="color: #2d3748;">Confirmer votre adresse email</h2>
      <p style="color: #4a5568; line-height: 1.6;">
        Merci de vous être inscrit sur <strong>NestHome</strong>. Cliquez sur le bouton ci-dessous pour activer votre compte.
      </p>
      <a href="${url}"
        style="display: inline-block; margin: 24px 0; padding: 12px 28px; background: #3182ce; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Vérifier mon email
      </a>
      <p style="color: #718096; font-size: 13px;">
        Ce lien expire dans <strong>24 heures</strong>. Si vous n'avez pas créé de compte, ignorez cet email.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 32px;" />
      <p style="color: #a0aec0; font-size: 12px;">NestHome &mdash; Plateforme immobilière</p>
    </div>
  `;
}

/**
 * Returns a styled HTML email for password reset.
 */
export function resetPasswordEmailTemplate(url: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 8px;">
      <h2 style="color: #2d3748;">Réinitialiser votre mot de passe</h2>
      <p style="color: #4a5568; line-height: 1.6;">
        Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le bouton ci-dessous pour continuer.
      </p>
      <a href="${url}"
        style="display: inline-block; margin: 24px 0; padding: 12px 28px; background: #e53e3e; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Réinitialiser mon mot de passe
      </a>
      <p style="color: #718096; font-size: 13px;">
        Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas fait cette demande, ignorez cet email.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 32px;" />
      <p style="color: #a0aec0; font-size: 12px;">NestHome &mdash; Plateforme immobilière</p>
    </div>
  `;
}
