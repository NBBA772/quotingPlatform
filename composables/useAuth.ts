import { useRouter } from "#app";
import { ISession } from "~~/types/ISession";
import { IUser } from "~/types/IUser";
import useErrorMapper from "./useErrorMapper";

// cookie helper
export const useAuthCookie = () => useCookie('auth_token');

export async function useUser(): Promise<IUser | null> {
  const authCookie = useAuthCookie().value;
  const user = useState<IUser | null>('user');

  if (authCookie && !user.value) {
    const cookieHeaders = useRequestHeaders(['cookie']);
    const { data } = await useFetch<IUser>('/api/auth/getByAuthToken', {
      headers: cookieHeaders as HeadersInit,
    });
    user.value = data.value;
  }

  return user.value;
}

export async function useLoggedIn() {
  const user = await useUser();
  return !!user?.id;
}

export async function userLogout() {
    useState('user').value = null;
  await useRouter().push('/');
  await $fetch('/api/auth/logout', { method: 'POST' });

  window.location.reload();
}
// ------------------------
// Register
// ------------------------
export interface CompanyInfo {
  companyName: string;
  ein?: string;
  salesmanCode?: string;
  industry: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  companyPhone: string;
  companyEmail: string;
  website?: string;
  employeeSize: string;
}

export interface FormValidation {
  hasErrors: boolean;
  loggedIn?: boolean;
  errors?: Map<string, any>;
}

export async function registerWithEmail(data: any) {
  try {
    const res = await $fetch('/api/auth/register', {
      method: 'POST',
      body: data,
    });

    if (res?.id) { // assume the API returns user object with id
      useState('user').value = res;
      const router = useRouter();
      await router.push(`/dashboard/`);
    }

    return { hasErrors: false, loggedIn: true, ...res };
  } catch (error: any) {
    console.error('Register error:', error);
    return { hasErrors: true, errors: error.data || {} };
  }
}



// ------------------------
// Login
// ------------------------
export async function loginWithEmail(usernameOrEmail: string, password: string): Promise<FormValidation> {
  try {
    const result = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { usernameOrEmail, password },
    });

    if (!result?.id) throw new Error('something went wrong');
    useState('user').value = result;
    await useRouter().push('/dashboard');

    return { hasErrors: false, loggedIn: true };
  } catch (error: any) {
    const errorData = error?.data?.data ?? error?.data ?? { message: error.message ?? 'Unknown error' };
    return useErrorMapper(errorData);
  }
}


