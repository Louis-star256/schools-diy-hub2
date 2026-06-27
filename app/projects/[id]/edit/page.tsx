
'use client';

import { ProjectForm } from '@/components/projects/project-form';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { BackButton } from '@/components/back-button';
import type { Project } from '@/lib/types';
import { use } from 'react';

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const projectRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'projects', id) : null),
    [firestore, id]
  );
  const { data: project, isLoading: projectLoading } = useDoc<Project>(projectRef);

  const isLoading = isUserLoading || projectLoading;
  const isOwner = user?.uid === project?.userId;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    notFound();
  }

  if (!isOwner) {
    return (
      <div className="container mx-auto max-w-2xl text-center py-12">
        <Alert variant="destructive">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to edit this project.
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link href={`/projects/${id}`}>Go Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <BackButton />
      <ProjectForm project={project} />
    </div>
  );
}
