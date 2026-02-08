import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ForgotPasswordPage from '../../../routes/forgot-password/+page.svelte';

type SuperValidated = {
	valid: boolean;
	posted: boolean;
	errors: Record<string, string[]>;
	data: { email: string };
	constraints: Record<string, unknown>;
	message?: string;
	id: string;
};

type PageData = { form: SuperValidated };

type ActionData = {
	form: SuperValidated;
	success: boolean;
	message: string;
};

describe('Forgot Password Page Component', () => {
	const mockFormData: PageData = {
		form: {
			valid: true,
			posted: false,
			errors: {},
			data: { email: '' },
			constraints: {},
			message: undefined,
			id: 'test-form'
		}
	};

	it('renders forgot password form without errors', () => {
		expect.assertions(1);
		const { container } = render(ForgotPasswordPage, {
			props: {
				data: mockFormData
			} as any
		});
		expect(container).toBeTruthy();
	});

	it('renders with validation error', () => {
		expect.assertions(1);
		const dataWithErrors: PageData = {
			form: {
				...mockFormData.form,
				valid: false,
				errors: {
					email: ['Invalid email address']
				}
			}
		};
		const { container } = render(ForgotPasswordPage, {
			props: {
				data: dataWithErrors
			} as any
		});
		expect(container).toBeTruthy();
	});

	it('renders with success message', () => {
		expect.assertions(1);
		const actionData: ActionData = {
			form: mockFormData.form,
			success: true,
			message: 'Password reset link sent'
		};
		const { container } = render(ForgotPasswordPage, {
			props: {
				data: mockFormData,
				form: actionData
			} as any
		});
		expect(container).toBeTruthy();
	});
});
