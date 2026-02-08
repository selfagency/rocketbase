import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ForgotPasswordPage from '../../../routes/forgot-password/+page.svelte';

type PageData = { form: any };

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

	it('renders forgot password form without errors', async () => {
		expect.assertions(1);
		const { container } = await render(ForgotPasswordPage, { props: { data: mockFormData } });
		expect(container).toBeTruthy();
	});

	it('renders with validation error', async () => {
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
		const { container } = await render(ForgotPasswordPage, { props: { data: dataWithErrors } });
		expect(container).toBeTruthy();
	});

	it('renders with success message', async () => {
		expect.assertions(1);
		const { container } = await render(ForgotPasswordPage, {
			props: {
				data: mockFormData,
				form: {
					success: true,
					message: 'Password reset link sent'
				}
			}
		});
		expect(container).toBeTruthy();
	});
});
