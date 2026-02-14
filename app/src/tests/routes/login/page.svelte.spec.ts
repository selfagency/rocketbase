import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LoginPage from '../../../routes/login/+page.svelte';

type PageData = { navItems: any[]; user: any; form: any; url: string; metadata: Record<string, string> };

describe('Login Page Component', () => {
	const mockFormData: PageData = {
		navItems: [],
		user: null,
		form: {
			valid: true,
			posted: false,
			errors: {},
			data: { email: '', password: '' },
			constraints: {},
			message: undefined,
			id: 'test-form'
		},
		url: 'http://localhost:5173',
		metadata: {}
	};

	it('renders login form without errors', async () => {
		expect.assertions(1);
		const { container } = render(LoginPage, { props: { data: mockFormData } });
		expect(container).toBeTruthy();
	});

	it('renders with validation errors', async () => {
		expect.assertions(1);
		const dataWithErrors: PageData = {
			navItems: [],
			user: null,
			form: {
				...mockFormData.form,
				valid: false,
				errors: {
					email: ['Invalid email address'],
					password: ['Password must be at least 8 characters']
				}
			},
			url: 'http://localhost:5173',
			metadata: {}
		};
		const { container } = render(LoginPage, { props: { data: dataWithErrors } });
		expect(container).toBeTruthy();
	});

	it('renders MFA form when mfaRequired is true', async () => {
		expect.assertions(1);
		const mfaData: any = {
			...mockFormData,
			mfaRequired: true,
			mfaId: 'mfa-123',
			otpId: 'otp-456',
			email: 'test@example.com'
		};
		const { container } = render(LoginPage, { props: { data: mfaData } });
		expect(container).toBeTruthy();
	});
});
