import { redirect } from 'next/navigation';

export default function VolunteerPageRedirect() {
  redirect('/volunteer/home');
}
