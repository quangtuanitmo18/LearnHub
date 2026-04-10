import { redirect } from 'next/navigation';

export default function MyCertificatesRedirect() {
  redirect('/my-profile?tab=certificates');
}
