import * as v from 'valibot';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';

const LoginSchema = v.object({
    username: v.string([
        v.minLength(1, 'Username is required')
    ]),
    password: v.string([
        v.minLength(1, 'Password is required'),
        v.minLength(8, 'Password must be at least 8 characters')
    ])
});

export const load = async () => {
    const form = await superValidate(valibot(LoginSchema));
    return { form };
};

export const actions = {
    default: async ({ request }) => {
        const form = await superValidate(request, valibot(LoginSchema));

        if (!form.valid) {
            return fail(400, { form });
        }

        try {
            const response = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: form.data.username,
                    password: form.data.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                return fail(401, {
                    form: {
                        ...form,
                        errors: { username: data.message || 'Invalid credentials' }
                    }
                });
            }

            // Successfully logged in
            return { 
                form,
                success: true,
                token: data.token,
                userRole: data.user_role 
            };
        } catch (error) {
            return fail(500, {
                form: {
                    ...form,
                    errors: { username: 'Server error occurred' }
                }
            });
        }
    }
};
