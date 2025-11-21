
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { deployLwc } from '@/lib/actions';
import { useUser } from '@/firebase';

const lwcTargetOptions = [
  'lightning__AppPage', 'lightning__HomePage', 'lightning__RecordPage', 'lightning__Tab', 'lightning__Inbox', 
  'lightning__UtilityBar', 'lightning__FlowScreen', 'lightning__RecordAction', 'lightning__GlobalAction', 
  'lightning__UrlAddressable', 'lightning__AgentforceInput', 'lightning__AgentforceOutput', 'lightning__ECSFSApp', 
  'lightning__VoiceExtension', 'lightning__ServiceDocument', 'lightning__EnablementProgram', 'lightningSnapin__PreChat', 
  'lightningSnapin__Minimized', 'lightningSnapin__ChatHeader', 'lightningSnapin__ChatMessage', 
  'lightningSnapin__MessagingPreChat', 'lightningSnapin__MessagingHeader', 'lightningStatic__Email', 
  'lightningCommunity__Default', 'lightningCommunity__Page', 'lightningCommunity__Page_Layout', 
  'lightningCommunity__Theme_Layout', 'analytics__Dashboard'
];

const createLwcSchema = z.object({
  componentName: z.string().min(1, 'Component name is required.').regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Invalid name format.'),
  isExposed: z.boolean().default(false),
  includeCss: z.boolean().default(true),
  includeSvg: z.boolean().default(false),
  masterLabel: z.string().optional(),
  apiVersion: z.string().default('63.0'),
  description: z.string().optional(),
  targets: z.array(z.string()).optional(),
});

type CreateLwcFormData = z.infer<typeof createLwcSchema>;

interface CreateLwcFormProps {
  onFormSubmit: (data: any) => void;
  onCancel: () => void;
}

const initialHtml = `<template>
    <lightning-card title="My LWC Component">
        <div class="slds-m-around_medium">
            <p>Hello, World!</p>
        </div>
    </lightning-card>
</template>`;
const initialJs = `import { LightningElement } from 'lwc';
export default class MyComponent extends LightningElement {}`;
const initialCss = `:host { display: block; }`;

export function CreateLwcForm({ onFormSubmit, onCancel }: CreateLwcFormProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const { control, register, handleSubmit, formState: { errors }, watch } = useForm<CreateLwcFormData>({
    resolver: zodResolver(createLwcSchema),
    defaultValues: {
      isExposed: true,
      includeCss: true,
      targets: ['lightning__AppPage'],
      apiVersion: '60.0',
    }
  });
  
  const isExposed = watch('isExposed');

  const onSubmit = async (data: CreateLwcFormData) => {
    if (!user) {
        toast({ title: "Error", description: "You must be logged in to deploy components.", variant: "destructive" });
        return;
    }
    
    setIsDeploying(true);
    
    const jsCode = `import { LightningElement } from 'lwc';\nexport default class ${data.componentName} extends LightningElement {}`;
    
    const result = await deployLwc(user.uid, {
        ...data,
        masterLabel: data.masterLabel || data.componentName,
        targets: data.isExposed ? (data.targets || []) : [],
        html: initialHtml.replace('My LWC Component', data.masterLabel || data.componentName),
        js: jsCode,
        css: data.includeCss ? initialCss : '',
        svg: data.includeSvg ? '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" /></svg>' : undefined,
    });

    if (result.success) {
        toast({ title: "Success!", description: `Component "${data.componentName}" deployed successfully.` });
        onFormSubmit({
            componentName: data.componentName,
            masterLabel: data.masterLabel || data.componentName,
        });
    } else {
        toast({ title: "Deployment Failed", description: result.error, variant: "destructive" });
    }

    setIsDeploying(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DrawerHeader className="flex flex-row items-center justify-between border-b p-4">
        <div>
          <DrawerTitle>Create New Lightning Web Component</DrawerTitle>
          <DrawerDescription>Configure and deploy a new LWC to your connected org.</DrawerDescription>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} type="button" size="sm">Cancel</Button>
            <Button type="submit" disabled={isDeploying} size="sm">
              {isDeploying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Deploy
            </Button>
        </div>
      </DrawerHeader>
      <div className="p-4 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
                <div>
                    <Label htmlFor="componentName" className="font-semibold">Component Name <span className="text-red-500">*</span></Label>
                    <Input id="componentName" {...register('componentName')} placeholder="myComponent" className="mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">Enter name without spaces and special characters.</p>
                    {errors.componentName && <p className="text-sm text-red-500 mt-1">{errors.componentName.message}</p>}
                </div>
                
                <div className="flex items-center space-x-6">
                    <FormFieldItem control={control} name="isExposed" label="isExposed" />
                    <FormFieldItem control={control} name="includeCss" label="Include CSS file" />
                    <FormFieldItem control={control} name="includeSvg" label="Include SVG file" />
                </div>

                <Separator />
                
                <h3 className="font-semibold text-lg">Additional Configurations</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="masterLabel">Master Label</Label>
                        <Input id="masterLabel" {...register('masterLabel')} placeholder="Master Label" className="mt-1" />
                    </div>
                     <div>
                        <Label htmlFor="apiVersion">API Version</Label>
                        <Controller
                            name="apiVersion"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger id="apiVersion" className="mt-1">
                                        <SelectValue placeholder="Select version" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="63.0">63.0</SelectItem>
                                        <SelectItem value="62.0">62.0</SelectItem>
                                        <SelectItem value="61.0">61.0</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" {...register('description')} placeholder="Description" className="mt-1" />
                </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Target Configuration</h3>
                <Card className="h-[350px]">
                    <ScrollArea className="h-full">
                        <CardContent className="p-4 space-y-3">
                        <Controller
                            name="targets"
                            control={control}
                            render={({ field }) => (
                                <>
                                {lwcTargetOptions.map(target => (
                                    <div key={target} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`target-${target}`}
                                            checked={field.value?.includes(target)}
                                            onCheckedChange={(checked) => {
                                                const newValue = checked
                                                    ? [...(field.value || []), target]
                                                    : (field.value || []).filter((value) => value !== target);
                                                field.onChange(newValue);
                                            }}
                                            disabled={!isExposed}
                                        />
                                        <Label htmlFor={`target-${target}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            {target}
                                        </Label>
                                    </div>
                                ))}
                                </>
                            )}
                        />
                        </CardContent>
                    </ScrollArea>
                </Card>
            </div>
        </div>
      </div>
    </form>
  );
}

const FormFieldItem = ({ control, name, label, disabled = false }: { control: any, name: string, label: string, disabled?: boolean }) => (
  <div className="flex items-center space-x-2">
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Checkbox
          id={name}
          checked={field.value}
          onCheckedChange={field.onChange}
          disabled={disabled}
        />
      )}
    />
    <Label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {label}
    </Label>
  </div>
);
