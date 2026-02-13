<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { pageSchema, type PageSchema } from './schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { toast } from '$lib/stores/toast';

	let {
		data,
		isEdit = false
	}: {
		data: { form: SuperValidated<Infer<PageSchema>> };
		isEdit?: boolean;
	} = $props();

	const form = superForm(data.form, {
		validators: zod4Client(pageSchema),
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === 'redirect') {
				toast(isEdit ? 'Page updated successfully' : 'Page created successfully', 'success');
			} else if (result.type === 'failure') {
				toast('Failed to save page', 'error');
			}
		}
	});

	const { form: formData, enhance } = form;

	// Generate slug from title
	function generateSlug() {
		if ($formData.title && !$formData.slug) {
			$formData.slug = $formData.title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '');
		}
	}
</script>

<form method="POST" use:enhance enctype="multipart/form-data" class="space-y-6">
	<div class="grid gap-6 md:grid-cols-2">
		<!-- Title -->
		<Form.Field {form} name="title" class="md:col-span-2">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Title</Form.Label>
					<Input
						{...props}
						bind:value={$formData.title}
						type="text"
						onblur={generateSlug}
						placeholder="Page title"
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Slug -->
		<Form.Field {form} name="slug" class="md:col-span-2">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Slug</Form.Label>
					<Input {...props} bind:value={$formData.slug} type="text" placeholder="page-slug" />
				{/snippet}
			</Form.Control>
			<Form.Description>URL-friendly identifier (lowercase, numbers, hyphens)</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Summary -->
		<Form.Field {form} name="summary" class="md:col-span-2">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Summary</Form.Label>
					<Textarea
						{...props}
						bind:value={$formData.summary}
						placeholder="Brief page description"
						rows={3}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Content -->
		<Form.Field {form} name="content" class="md:col-span-2">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Content</Form.Label>
					<Textarea
						{...props}
						bind:value={$formData.content}
						placeholder="Page content (HTML supported)"
						rows={10}
					/>
				{/snippet}
			</Form.Control>
			<Form.Description>Full page content (supports HTML)</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Order -->
		<Form.Field {form} name="order">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Order</Form.Label>
					<Input {...props} bind:value={$formData.order} type="number" min="0" placeholder="0" />
				{/snippet}
			</Form.Control>
			<Form.Description>Display order (lower numbers appear first)</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Image Upload -->
		<Form.Field {form} name="image">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Featured Image</Form.Label>
					<Input {...props} type="file" accept="image/*" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>

	<!-- Switches Section -->
	<div class="space-y-4 rounded-lg border p-4">
		<h3 class="font-semibold">Page Settings</h3>

		<Form.Field {form} name="published">
			<Form.Control>
				{#snippet children({ props })}
					<div class="flex items-center gap-3">
						<Switch {...props} id="published" bind:checked={$formData.published} />
						<Label for="published">Published</Label>
					</div>
				{/snippet}
			</Form.Control>
			<Form.Description>Make this page visible to the public</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="require_login">
			<Form.Control>
				{#snippet children({ props })}
					<div class="flex items-center gap-3">
						<Switch {...props} id="require_login" bind:checked={$formData.require_login} />
						<Label for="require_login">Require Login</Label>
					</div>
				{/snippet}
			</Form.Control>
			<Form.Description>Users must be logged in to view this page</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="subscriber_only">
			<Form.Control>
				{#snippet children({ props })}
					<div class="flex items-center gap-3">
						<Switch {...props} id="subscriber_only" bind:checked={$formData.subscriber_only} />
						<Label for="subscriber_only">Subscriber Only</Label>
					</div>
				{/snippet}
			</Form.Control>
			<Form.Description>Only subscribers can view this page</Form.Description>
			<Form.FieldErrors />
		</Form.Field>
	</div>

	<!-- Custom CSS -->
	<Form.Field {form} name="custom_css" class="md:col-span-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Custom CSS</Form.Label>
				<Textarea
					{...props}
					bind:value={$formData.custom_css}
					placeholder=".my-class {'{'} color: red; {'}'}"
					rows={5}
					class="font-mono text-sm"
				/>
			{/snippet}
		</Form.Control>
		<Form.Description>Custom CSS styles for this page only</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<!-- Actions -->
	<div class="flex gap-4">
		<Form.Button type="submit">{isEdit ? 'Update Page' : 'Create Page'}</Form.Button>
		<Button type="button" variant="outline" href="/admin/pages">Cancel</Button>
	</div>
</form>
