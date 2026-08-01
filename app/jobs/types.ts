export type JobTypes = {
  sendEmail: {
    to: string | string[];
    subject: string;
    html?: string;
    text: string;
    from?: string;
    replyTo?: string[];
  };
  newsletterSend: void;
};
