type ForgotPasswordActionData = {
  success?: boolean;
};

type ForgotPasswordUpdatePayload = {
  form: {
    valid: boolean;
  };
  result: {
    data?: {
      success?: boolean;
    };
  };
};

export function shouldShowForgotPasswordSuccessFromAction(actionData: ForgotPasswordActionData | undefined): boolean {
  return Boolean(actionData?.success);
}

export function shouldShowForgotPasswordSuccessFromUpdate(payload: ForgotPasswordUpdatePayload): boolean {
  return Boolean(payload.form.valid && payload.result.data?.success);
}

export function createForgotPasswordOnUpdateHandler(params: { setShowSuccess: (value: boolean) => void }) {
  return (payload: ForgotPasswordUpdatePayload) => {
    if (shouldShowForgotPasswordSuccessFromUpdate(payload)) {
      params.setShowSuccess(true);
    }
  };
}
