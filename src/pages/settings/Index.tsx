import { useState } from "react";
import Layout from "../../components/layouts/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { Settings as SettingsIcon, MessageSquareQuote } from "lucide-react";
import { SETTINGS_GROUPS, GroupDef } from "./settingsConfig";
import { GroupForm } from "./_components/GroupForm";
import { TestimonialsManager } from "./_components/TestimonialsManager";
import { useSettingsManager } from "./_hooks/useSettingsManager";

/** Testimonials are a CRUD list (not key/value settings) so they get their own tab. */
const TESTIMONIALS_TAB = "testimonials";

const Index = () => {
  const {
    isLoading,
    isError,
    isSaving,
    aboutPageLoading,
    settingsMap,
    aboutImageUrl,
    save,
  } = useSettingsManager();
  const [savingGroup, setSavingGroup] = useState<string | null>(null);

  const initialFor = (group: GroupDef) => {
    const obj: Record<string, string> = {};
    group.fields.forEach((f) => {
      obj[f.key] = settingsMap.get(f.key)?.value ?? "";
    });
    return obj;
  };

  const handleSave = async (
    group: GroupDef,
    values: Record<string, string>,
    imageFile: File | null
  ) => {
    setSavingGroup(group.id);
    try {
      await save(group.id, values, imageFile);
    } finally {
      setSavingGroup(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl pb-10">
        <div className="mt-4 flex items-start gap-3">
          <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <SettingsIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Site Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Edit your storefront content section by section.
            </p>
          </div>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              Loading settings…
            </CardContent>
          </Card>
        ) : isError ? (
          <Card>
            <CardContent className="py-16 text-center text-destructive">
              Couldn’t load settings. Please refresh.
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue={SETTINGS_GROUPS[0].id} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto overflow-x-auto">
              {SETTINGS_GROUPS.map((g) => {
                const Icon = g.icon;
                return (
                  <TabsTrigger
                    key={g.id}
                    value={g.id}
                    className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {g.label}
                  </TabsTrigger>
                );
              })}
              <TabsTrigger
                value={TESTIMONIALS_TAB}
                className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                <MessageSquareQuote className="mr-2 h-4 w-4" />
                Testimonial
              </TabsTrigger>
            </TabsList>

            {SETTINGS_GROUPS.map((g) => (
              // forceMount keeps each tab's form mounted so edits aren't lost
              // when switching tabs (Radix unmounts inactive content by default).
              <TabsContent
                key={g.id}
                value={g.id}
                forceMount
                className="mt-6 data-[state=inactive]:hidden"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{g.label}</CardTitle>
                    {g.description && (
                      <CardDescription>{g.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <GroupForm
                      group={g}
                      initialValues={initialFor(g)}
                      currentImageUrl={g.hasImage ? aboutImageUrl : null}
                      onSave={(values, imageFile) =>
                        handleSave(g, values, imageFile)
                      }
                      isSaving={isSaving && savingGroup === g.id}
                      disabled={g.hasImage ? aboutPageLoading : false}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            ))}

            <TabsContent value={TESTIMONIALS_TAB} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Testimonials</CardTitle>
                  <CardDescription>
                    Customer quotes shown on the storefront home page.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TestimonialsManager />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default Index;
