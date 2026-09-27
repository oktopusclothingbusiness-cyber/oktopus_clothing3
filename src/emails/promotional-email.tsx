import React from 'react';
import { StandardEmailTemplate, StandardEmailProps } from './standard-email';

export type PromotionalEmailProps = {
  subject: string;
  messageBody: string;
  type?: 'update' | 'promotion' | 'information' | 'announcement';
  actionText?: string;
  actionUrl?: string;
  headerTheme?: 'light' | 'dark';
};

export const PromotionalEmail = ({
  subject,
  messageBody,
  type = 'promotion',
  actionText = 'Shop The Collection →',
  actionUrl = 'https://oktopusclothing.in',
  headerTheme = 'light',
}: PromotionalEmailProps) => {
  return (
    <StandardEmailTemplate
      subject={subject}
      messageBody={messageBody}
      type={type}
      actionText={actionText}
      actionUrl={actionUrl}
      headerTheme={headerTheme}
    />
  );
};

export default PromotionalEmail;
