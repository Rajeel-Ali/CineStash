
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Download, Upload, Trash2, Database, Cog, Loader2, AlertTriangle, Mail, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CineItem } from '@/app/lib/types';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useInstallPrompt } from '@/hooks/use-install-prompt';
import { useLibraryManager } from '@/hooks/use-library-manager';
import { searchTMDB } from '@/app/lib/tmdb';
import { useUserLibrary } from '@/hooks/use-user-library';

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isCollaborativeFiltering, setIsCollaborativeFiltering] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { canInstall, installPrompt } = useInstallPrompt();
  const { addToLibrary } = useLibraryManager();
  const { library: currentLibrary } = useUserLibrary();

  useEffect(() => {
    const savedPref = localStorage.getItem('collaborativeFiltering');
    setIsCollaborativeFiltering(savedPref === 'true');
  }, []);

  const handleCollabFilterToggle = (enabled: boolean) => {
    setIsCollaborativeFiltering(enabled);
    localStorage.setItem('collaborativeFiltering', String(enabled));
    toast({
      title: "Preference Saved",
      description: `Collaborative filtering has been ${enabled ? 'enabled' : 'disabled'}.`,
    });
  }

  const handleExport = (format: 'json' | 'csv') => {
    const libraryString = localStorage.getItem('cineStashLibrary');
    if (!libraryString) {
      toast({ title: "Your library is empty", variant: 'destructive' });
      return;
    }
    const library: CineItem[] = JSON.parse(libraryString);
    if (library.length === 0) {
      toast({ title: "Your library is empty", variant: 'destructive' });
      return;
    }

    let data: string;
    let mimeType: string;
    let fileExtension: string;

    if (format === 'json') {
      data = JSON.stringify(library, null, 2);
      mimeType = 'application/json';
      fileExtension = 'json';
    } else { // csv
      const csvData = library.map(item => ({
        'Title': item.title,
        'Year': item.year,
        'Type': item.type,
        'Status': item.status,
        'Rating': item.rating,
        'DateAdded': item.dateAdded,
        'DateWatched': item.dateWatched,
        'TMDB_ID': item.tmdbId,
        'IMDB_ID': item.imdbId,
        'Note': item.note,
        'Tags': item.tags.join(','),
      }));
      data = Papa.unparse(csvData);
      mimeType = 'text/csv';
      fileExtension = 'csv';
    }

    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cinestash_export.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: "Export successful", description: `Your library has been exported as a ${format.toUpperCase()} file.`});
  };

  const processImportedData = async (data: any[]) => {
    setIsImporting(true);
    let successCount = 0;
    let failureCount = 0;
    let alreadyExistsCount = 0;

    const findKey = (obj: any, potentialKeys: string[]) => {
      for (const key of potentialKeys) {
        if (obj[key] !== undefined && obj[key] !== null) return obj[key];
      }
      return null;
    }

    const libraryTmdbIds = new Set(currentLibrary.map(item => item.tmdbId));

    for (const row of data) {
      let title = findKey(row, ['Title', 'title', 'Name', 'name', 'Primary Title']);
      let year = findKey(row, ['Year', 'year', 'release_date']);
      
      if (year && typeof year === 'string' && year.includes('-')) {
        year = new Date(year).getFullYear();
      }

      if (title) {
        try {
          const query = year ? `${title} ${year}` : title;
          const results = await searchTMDB(query);
          
          if (results.length > 0) {
            const bestMatch = results[0];
            if (!libraryTmdbIds.has(bestMatch.tmdbId)) {
                addToLibrary(bestMatch, 'To Watch', { silent: true });
                libraryTmdbIds.add(bestMatch.tmdbId);
                successCount++;
            } else {
                alreadyExistsCount++;
            }
          } else {
            console.log(`No search results for: "${query}"`);
            failureCount++;
          }
        } catch (e) {
          console.error("Error processing row:", row, e);
          failureCount++;
        }
      } else {
        failureCount++;
      }
    }
    setIsImporting(false);

    let description = `${successCount} new items imported.`;
    if (failureCount > 0) description += ` ${failureCount} failed.`;
    if (alreadyExistsCount > 0) description += ` ${alreadyExistsCount} were already in your library.`;

    toast({
        title: "Import Complete",
        description: description,
    });
  }

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsImporting(true);
      
      try {
        if (file.name.endsWith('.csv')) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    processImportedData(results.data);
                },
                error: (error) => {
                    throw new Error(error.message);
                }
            });
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                processImportedData(json);
            };
            reader.onerror = () => { throw new Error("Failed to read the file."); };
            reader.readAsArrayBuffer(file);
        } else {
             throw new Error("Unsupported file type.");
        }
      } catch (error: any) {
        console.error("Import failed:", error);
        toast({ title: "Import Failed", description: error.message || "An unknown error occurred.", variant: "destructive" });
        setIsImporting(false);
      }
    };
    input.click();
  };

  const handleDownloadTemplate = () => {
    const templateData = [{
        'Title': 'Inception',
        'Year': 2010,
    }];
    const csv = Papa.unparse(templateData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cinestash_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Template downloaded"});
  }


  const handleClearImageCache = async () => {
    if ('caches' in window) {
      try {
        const cacheKeys = await caches.keys();
        const imageCacheKeys = cacheKeys.filter(key => key.includes('image')); // Heuristic
        
        if (imageCacheKeys.length === 0) {
          toast({
            title: "No Image Caches Found",
            description: "There were no specific image caches to clear.",
          });
          return;
        }

        await Promise.all(imageCacheKeys.map(key => caches.delete(key)));
        
        toast({
          title: "Image Cache Cleared",
          description: "Cached poster images have been successfully removed.",
        });
      } catch (error) {
        console.error("Error clearing image cache:", error);
        toast({
          title: "Error",
          description: "Could not clear the image cache. Please try again.",
          variant: "destructive",
        });
      }
    } else {
       toast({
        title: "Cache API not supported",
        description: "Your browser does not support the necessary features to clear the cache.",
        variant: "destructive",
      });
    }
  }

  const handleDeleteAllData = () => {
    // Clear all relevant local and session storage
    localStorage.removeItem('cineStashLibrary');
    localStorage.removeItem('onboardingComplete');
    localStorage.removeItem('swipedItems_movies');
    localStorage.removeItem('swipedItems_shows');
    localStorage.removeItem('discover_popularMovies');
    localStorage.removeItem('discover_popularShows');
    localStorage.removeItem('discover_moviePage');
    localStorage.removeItem('discover_showPage');

    // Announce success
    toast({
      title: "All Data Deleted",
      description: "Your library and preferences have been wiped. Redirecting to onboarding.",
    });

    // Redirect to onboarding to start fresh
    router.push('/onboarding');
  };


  return (
    <div className="container mx-auto max-w-3xl py-8 px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Settings"
        description="Manage your data and preferences."
      />

      <div className="mt-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database />
              <span>Data Management</span>
            </CardTitle>
            <CardDescription>
              Import, export, or manage your CineStash data. You own your data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Import Data</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="flex-1" onClick={handleImport} disabled={isImporting}>
                   {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                   Import from File
                </Button>
                <Button variant="link" className="text-muted-foreground" onClick={handleDownloadTemplate}>
                  Download Template
                </Button>
              </div>
               <p className="text-xs text-muted-foreground mt-2">Supports Letterboxd CSV, IMDb CSV, and our .csv/.xlsx template.</p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Export Data</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleExport('csv')}>
                  <Download className="mr-2 h-4 w-4" /> Export as CSV
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleExport('json')}>
                  <Download className="mr-2 h-4 w-4" /> Export as JSON
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cog />
              <span>General Settings</span>
            </CardTitle>
             <CardDescription>
              Customize application behavior.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="collab-filter-toggle" className="font-semibold">Collaborative Filtering</Label>
                <p className="text-sm text-muted-foreground">
                  Get suggestions based on similar users.
                </p>
              </div>
              <Switch 
                id="collab-filter-toggle"
                checked={isCollaborativeFiltering}
                onCheckedChange={handleCollabFilterToggle}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Image Cache</h3>
                 <p className="text-sm text-muted-foreground">
                  Clear cached poster images to free up space.
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={handleClearImageCache}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear Cache
              </Button>
            </div>
            {canInstall && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Install CineStash</h3>
                    <p className="text-sm text-muted-foreground">
                      Install the app on your device for a better experience.
                    </p>
                  </div>
                  <Button variant="default" size="sm" onClick={installPrompt}>
                    <Download className="mr-2 h-4 w-4" /> Install
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail />
              <span>Support & Feedback</span>
            </CardTitle>
            <CardDescription>
              Have questions or feedback? Let us know!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="mailto:feedback@rajeel.me">
                <Mail className="mr-2 h-4 w-4" /> Contact Developer
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/privacy">
                <Shield className="mr-2 h-4 w-4" /> Privacy Policy
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle />
                    <span>Destructive Zone</span>
                </CardTitle>
                <CardDescription>
                    These actions are permanent and cannot be undone.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold">Delete All Data</h3>
                        <p className="text-sm text-muted-foreground">
                        Erase your entire library and all preferences.
                        </p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete All Data
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete all your
                                data, including your entire library and preferences from this device.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAllData}>
                                Yes, delete everything
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
