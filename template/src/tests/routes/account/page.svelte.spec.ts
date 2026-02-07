import { render } from 'vitest-browser-svelte';
import { describe, it, expect } from 'vitest';
import AccountPage from '../../../routes/account/+page.svelte';

type PageData = { profileForm: any; twoFactorRequestForm: any; twoFactorVerifyForm: any; twoFactorEnabled: boolean; user: any };

describe('Account Page Component', () => {
	const mockUser = {
		id: 'user-123',
		email: 'test@example.com',
		name: 'Test User',
		title: 'Developer',
		bio: 'Test bio',
		website: 'https://example.com',
		avatar: ''
	};

	const mockFormData: PageData = {
		profileForm: {
			valid: true,
			posted: false,
			errors: {},
			data: {
				name: 'Test User',
				email: 'test@example.com',
				title: 'Developer',
				bio: 'Test bio',
				website: 'https://example.com'
			},
			constraints: {},
			message: undefined,
			id: 'profile-form'
		},
		twoFactorRequestForm: {
			valid: true,
			posted: false,
			errors: {},
			data: {},
			constraints: {},
			message: undefined,
			id: 'tfa-request-form'
		},
		twoFactorVerifyForm: {
			valid: true,
			posted: false,
			errors: {},
			data: { otpId: '', code: '' },
			constraints: {},
			message: undefined,
			id: 'tfa-verify-form'
		},
		twoFactorEnabled: false,
		user: mockUser
	};

	it('renders account page without errors', async () => {
		expect.assertions(1);
		const { container } = await render(AccountPage, { props: { data: mockFormData } });
		expect(container).toBeTruthy();
	});

	it('renders with 2FA enabled', async () => {
		expect.assertions(1);
		const dataWith2FA: PageData = {
			...mockFormData,
			twoFactorEnabled: true
		};
		const { container } = await render(AccountPage, { props: { data: dataWith2FA } });
		expect(container).toBeTruthy();
	});

	it('renders with validation errors', async () => {
		expect.assertions(1);
		const dataWithErrors: PageData = {
			...mockFormData,
			profileForm: {
				...mockFormData.profileForm,
				valid: false,
				errors: {
					name: ['Name must be at least 2 characters'],
					email: ['Invalid email address']
				}
			}
		};
		const { container } = await render(AccountPage, { props: { data: dataWithErrors } });
		expect(container).toBeTruthy();
	});
});
