import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Protocol } from "@shared/schema";

// Define our own DeviceType interface to ensure compatibility with the UI
interface DeviceType {
  id: number;
  name: string;
  displayName: string;
  description: string;
  category: string;
  compatibleProtocols: string[];
  parameterTemplates: Record<string, string[]>;
  icon: string;
}

interface SettingsFormData {
  suricataPath: string;
  scanInterval: string;
  apiKey: string;
  [key: string]: string;
}

interface ProtocolFormData {
  name: string;
  displayName: string;
  description: string;
  defaultPort: number;
  capabilities: Record<string, boolean>;
  parameters: Record<string, any>;
  isEnabled: boolean;
}

interface DeviceTypeFormData {
  name: string;
  displayName: string;
  description: string;
  category: string;
  compatibleProtocols: string[];
  parameterTemplates: Record<string, string[]>;
  icon: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [autoScan, setAutoScan] = useState(true);
  const [selectedProtocol, setSelectedProtocol] = useState<number | null>(null);
  const [selectedDeviceType, setSelectedDeviceType] = useState<number | null>(null);
  const [editingProtocol, setEditingProtocol] = useState(false);
  const [editingDeviceType, setEditingDeviceType] = useState(false);
  
  // General settings form
  const { register, handleSubmit, formState } = useForm<SettingsFormData>({
    defaultValues: {
      suricataPath: "/var/log/suricata/eve.json",
      scanInterval: "5",
      apiKey: ""
    }
  });
  
  // Protocol form
  const protocolForm = useForm<ProtocolFormData>({
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      defaultPort: 0,
      capabilities: { read: false, write: false, subscribe: false },
      parameters: {},
      isEnabled: true
    }
  });
  
  // Device type form
  const deviceTypeForm = useForm<DeviceTypeFormData>({
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      category: "",
      compatibleProtocols: [],
      parameterTemplates: {},
      icon: ""
    }
  });
  
  // Fetch protocols and device types
  const { data: protocols } = useQuery<Protocol[]>({
    queryKey: ['/api/protocols'],
  });
  
  const { data: deviceTypes } = useQuery<DeviceType[]>({
    queryKey: ['/api/device-types'],
  });
  
  // Fetch selected protocol details
  const { data: selectedProtocolDetails } = useQuery<Protocol>({
    queryKey: ['/api/protocols', selectedProtocol],
    enabled: !!selectedProtocol,
  });
  
  // Fetch selected device type details
  const { data: selectedDeviceTypeDetails } = useQuery<DeviceType>({
    queryKey: ['/api/device-types', selectedDeviceType],
    enabled: !!selectedDeviceType,
  });
  
  // Update protocol form when selected protocol changes
  useEffect(() => {
    if (selectedProtocolDetails && editingProtocol) {
      protocolForm.reset({
        name: selectedProtocolDetails.name,
        displayName: selectedProtocolDetails.displayName,
        description: selectedProtocolDetails.description,
        defaultPort: selectedProtocolDetails.defaultPort || 0,
        capabilities: selectedProtocolDetails.capabilities || {},
        parameters: selectedProtocolDetails.parameters || {},
        isEnabled: selectedProtocolDetails.isEnabled || false
      });
    }
  }, [selectedProtocolDetails, editingProtocol]);
  
  // Update device type form when selected device type changes
  useEffect(() => {
    if (selectedDeviceTypeDetails && editingDeviceType) {
      deviceTypeForm.reset({
        name: selectedDeviceTypeDetails.name,
        displayName: selectedDeviceTypeDetails.displayName,
        description: selectedDeviceTypeDetails.description,
        category: selectedDeviceTypeDetails.category,
        compatibleProtocols: selectedDeviceTypeDetails.compatibleProtocols as string[],
        parameterTemplates: selectedDeviceTypeDetails.parameterTemplates as Record<string, string[]>,
        icon: selectedDeviceTypeDetails.icon || ""
      });
    }
  }, [selectedDeviceTypeDetails, editingDeviceType]);
  
  // Create protocol mutation
  const createProtocolMutation = useMutation({
    mutationFn: async (data: ProtocolFormData) => {
      return apiRequest('POST', '/api/protocols', data);
    },
    onSuccess: () => {
      toast({
        title: "Protocol created",
        description: "The protocol has been created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/protocols'] });
      protocolForm.reset();
      setEditingProtocol(false);
    }
  });
  
  // Update protocol mutation
  const updateProtocolMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<ProtocolFormData> }) => {
      return apiRequest('PATCH', `/api/protocols/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Protocol updated",
        description: "The protocol has been updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/protocols'] });
      queryClient.invalidateQueries({ queryKey: ['/api/protocols', selectedProtocol] });
      protocolForm.reset();
      setEditingProtocol(false);
    }
  });
  
  // Delete protocol mutation
  const deleteProtocolMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/protocols/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Protocol deleted",
        description: "The protocol has been deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/protocols'] });
      setSelectedProtocol(null);
    }
  });
  
  // Create device type mutation
  const createDeviceTypeMutation = useMutation({
    mutationFn: async (data: DeviceTypeFormData) => {
      return apiRequest('POST', '/api/device-types', data);
    },
    onSuccess: () => {
      toast({
        title: "Device type created",
        description: "The device type has been created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/device-types'] });
      deviceTypeForm.reset();
      setEditingDeviceType(false);
    }
  });
  
  // Update device type mutation
  const updateDeviceTypeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<DeviceTypeFormData> }) => {
      return apiRequest('PATCH', `/api/device-types/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Device type updated",
        description: "The device type has been updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/device-types'] });
      queryClient.invalidateQueries({ queryKey: ['/api/device-types', selectedDeviceType] });
      deviceTypeForm.reset();
      setEditingDeviceType(false);
    }
  });
  
  // Delete device type mutation
  const deleteDeviceTypeMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/device-types/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Device type deleted",
        description: "The device type has been deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/device-types'] });
      setSelectedDeviceType(null);
    }
  });
  
  // General settings submit handler
  const onSubmit = (data: SettingsFormData) => {
    console.log(data);
    toast({
      title: "Settings updated",
      description: "Your changes have been saved successfully"
    });
  };
  
  // Protocol form submit handler
  const handleProtocolSubmit = (data: ProtocolFormData) => {
    if (selectedProtocol && editingProtocol) {
      updateProtocolMutation.mutate({ id: selectedProtocol, data });
    } else {
      createProtocolMutation.mutate(data);
    }
  };
  
  // Device type form submit handler
  const handleDeviceTypeSubmit = (data: DeviceTypeFormData) => {
    if (selectedDeviceType && editingDeviceType) {
      updateDeviceTypeMutation.mutate({ id: selectedDeviceType, data });
    } else {
      createDeviceTypeMutation.mutate(data);
    }
  };
  
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure application preferences and system settings
        </p>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="protocols">Protocols</TabsTrigger>
          <TabsTrigger value="deviceTypes">Device Types</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage your application preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">UI Theme</Label>
                <Select defaultValue="system">
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose the application color scheme
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="utc">
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="local">Local Browser Time</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Set the timezone for timestamps and logs
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="protocols" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Protocol List */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Industrial Protocols</CardTitle>
                <CardDescription>
                  Manage supported industrial protocols
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Button 
                    onClick={() => {
                      setEditingProtocol(true);
                      setSelectedProtocol(null);
                      protocolForm.reset({
                        name: "",
                        displayName: "",
                        description: "",
                        defaultPort: 0,
                        capabilities: { read: false, write: false, subscribe: false },
                        parameters: {},
                        isEnabled: true
                      });
                    }}
                    variant="outline" 
                    className="w-full"
                  >
                    Add New Protocol
                  </Button>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {protocols?.map((protocol) => (
                      <div 
                        key={protocol.id}
                        className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${selectedProtocol === protocol.id ? 'bg-primary/10' : 'hover:bg-muted'}`}
                        onClick={() => setSelectedProtocol(protocol.id)}
                      >
                        <div>
                          <p className="font-medium">{protocol.displayName}</p>
                          <p className="text-sm text-muted-foreground">{protocol.name}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${protocol.isEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                    ))}
                    
                    {(!protocols || protocols.length === 0) && (
                      <p className="text-center text-muted-foreground py-4">No protocols configured</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Protocol Details/Edit */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {editingProtocol 
                    ? (selectedProtocol ? 'Edit Protocol' : 'New Protocol') 
                    : (selectedProtocolDetails ? selectedProtocolDetails.displayName : 'Protocol Details')}
                </CardTitle>
                <CardDescription>
                  {editingProtocol 
                    ? 'Configure protocol settings' 
                    : 'View protocol information and capabilities'}
                </CardDescription>
              </CardHeader>
              
              {editingProtocol ? (
                <form onSubmit={protocolForm.handleSubmit(handleProtocolSubmit)}>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Protocol ID</Label>
                        <Input 
                          id="name" 
                          {...protocolForm.register("name", { required: true })}
                          placeholder="modbus_tcp"
                        />
                        <p className="text-sm text-muted-foreground">
                          Unique identifier (no spaces)
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input 
                          id="displayName" 
                          {...protocolForm.register("displayName", { required: true })}
                          placeholder="Modbus TCP/IP"
                        />
                        <p className="text-sm text-muted-foreground">
                          Human-readable name
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input 
                        id="description" 
                        {...protocolForm.register("description")}
                        placeholder="Describe the protocol..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="defaultPort">Default Port</Label>
                      <Input 
                        id="defaultPort" 
                        type="number"
                        {...protocolForm.register("defaultPort", { valueAsNumber: true })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Capabilities</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="read"
                            checked={protocolForm.watch("capabilities.read")}
                            onCheckedChange={(checked) => {
                              protocolForm.setValue("capabilities.read", checked);
                            }}
                          />
                          <Label htmlFor="read">Read</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="write"
                            checked={protocolForm.watch("capabilities.write")}
                            onCheckedChange={(checked) => {
                              protocolForm.setValue("capabilities.write", checked);
                            }}
                          />
                          <Label htmlFor="write">Write</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="subscribe"
                            checked={protocolForm.watch("capabilities.subscribe")}
                            onCheckedChange={(checked) => {
                              protocolForm.setValue("capabilities.subscribe", checked);
                            }}
                          />
                          <Label htmlFor="subscribe">Subscribe</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="isEnabled"
                        checked={protocolForm.watch("isEnabled")}
                        onCheckedChange={(checked) => {
                          protocolForm.setValue("isEnabled", checked);
                        }}
                      />
                      <Label htmlFor="isEnabled">Enabled</Label>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setEditingProtocol(false);
                        protocolForm.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createProtocolMutation.isPending || updateProtocolMutation.isPending}>
                      {createProtocolMutation.isPending || updateProtocolMutation.isPending ? 'Saving...' : 'Save Protocol'}
                    </Button>
                  </CardFooter>
                </form>
              ) : (
                <>
                  <CardContent className="space-y-6">
                    {selectedProtocolDetails ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
                            <p>{selectedProtocolDetails.name}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Default Port</h3>
                            <p>{selectedProtocolDetails.defaultPort || 'None'}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                          <p>{selectedProtocolDetails.description}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Capabilities</h3>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {Object.entries(selectedProtocolDetails.capabilities || {}).map(([key, value]) => (
                              value ? (
                                <div key={key} className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm inline-flex items-center">
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                </div>
                              ) : null
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                          <div className={`mt-2 flex items-center ${selectedProtocolDetails.isEnabled ? 'text-green-600' : 'text-red-600'}`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${selectedProtocolDetails.isEnabled ? 'bg-green-600' : 'bg-red-600'}`}></div>
                            {selectedProtocolDetails.isEnabled ? 'Enabled' : 'Disabled'}
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">Select a protocol to view details</p>
                    )}
                  </CardContent>
                  
                  {selectedProtocolDetails && (
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this protocol?')) {
                            deleteProtocolMutation.mutate(selectedProtocolDetails.id);
                          }
                        }}
                        disabled={deleteProtocolMutation.isPending}
                      >
                        {deleteProtocolMutation.isPending ? 'Deleting...' : 'Delete'}
                      </Button>
                      <Button 
                        onClick={() => {
                          setEditingProtocol(true);
                        }}
                      >
                        Edit Protocol
                      </Button>
                    </CardFooter>
                  )}
                </>
              )}
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="deviceTypes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Device Type List */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Device Types</CardTitle>
                <CardDescription>
                  Manage supported device types
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Button 
                    onClick={() => {
                      setEditingDeviceType(true);
                      setSelectedDeviceType(null);
                      deviceTypeForm.reset({
                        name: "",
                        displayName: "",
                        description: "",
                        category: "",
                        compatibleProtocols: [],
                        parameterTemplates: {},
                        icon: ""
                      });
                    }}
                    variant="outline" 
                    className="w-full"
                  >
                    Add New Device Type
                  </Button>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {deviceTypes?.map((deviceType) => (
                      <div 
                        key={deviceType.id}
                        className={`p-2 rounded-md cursor-pointer ${selectedDeviceType === deviceType.id ? 'bg-primary/10' : 'hover:bg-muted'}`}
                        onClick={() => setSelectedDeviceType(deviceType.id)}
                      >
                        <p className="font-medium">{deviceType.displayName}</p>
                        <p className="text-sm text-muted-foreground">{deviceType.category}</p>
                      </div>
                    ))}
                    
                    {(!deviceTypes || deviceTypes.length === 0) && (
                      <p className="text-center text-muted-foreground py-4">No device types configured</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Device Type Details/Edit */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {editingDeviceType 
                    ? (selectedDeviceType ? 'Edit Device Type' : 'New Device Type') 
                    : (selectedDeviceTypeDetails ? selectedDeviceTypeDetails.displayName : 'Device Type Details')}
                </CardTitle>
                <CardDescription>
                  {editingDeviceType 
                    ? 'Configure device type settings' 
                    : 'View device type information and capabilities'}
                </CardDescription>
              </CardHeader>
              
              {editingDeviceType ? (
                <form onSubmit={deviceTypeForm.handleSubmit(handleDeviceTypeSubmit)}>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Type ID</Label>
                        <Input 
                          id="name" 
                          {...deviceTypeForm.register("name", { required: true })}
                          placeholder="plc"
                        />
                        <p className="text-sm text-muted-foreground">
                          Unique identifier (no spaces)
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input 
                          id="displayName" 
                          {...deviceTypeForm.register("displayName", { required: true })}
                          placeholder="Programmable Logic Controller"
                        />
                        <p className="text-sm text-muted-foreground">
                          Human-readable name
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input 
                        id="description" 
                        {...deviceTypeForm.register("description")}
                        placeholder="Describe the device type..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={deviceTypeForm.watch("category")}
                        onValueChange={(value) => deviceTypeForm.setValue("category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Controller">Controller</SelectItem>
                          <SelectItem value="Field Device">Field Device</SelectItem>
                          <SelectItem value="Network">Network</SelectItem>
                          <SelectItem value="Power Equipment">Power Equipment</SelectItem>
                          <SelectItem value="Operator Interface">Operator Interface</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="icon">Icon</Label>
                      <Input 
                        id="icon" 
                        {...deviceTypeForm.register("icon")}
                        placeholder="Icon name (e.g., cpu, server, activity)"
                      />
                      <p className="text-sm text-muted-foreground">
                        Lucide icon name
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Compatible Protocols</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {protocols?.map((protocol) => (
                          <div key={protocol.id} className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id={`protocol-${protocol.id}`}
                              checked={deviceTypeForm.watch("compatibleProtocols")?.includes(protocol.name)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const currentProtocols = deviceTypeForm.watch("compatibleProtocols") || [];
                                if (checked) {
                                  deviceTypeForm.setValue("compatibleProtocols", [...currentProtocols, protocol.name]);
                                } else {
                                  deviceTypeForm.setValue(
                                    "compatibleProtocols", 
                                    currentProtocols.filter(p => p !== protocol.name)
                                  );
                                }
                              }}
                            />
                            <Label htmlFor={`protocol-${protocol.id}`}>{protocol.displayName}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setEditingDeviceType(false);
                        deviceTypeForm.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createDeviceTypeMutation.isPending || updateDeviceTypeMutation.isPending}>
                      {createDeviceTypeMutation.isPending || updateDeviceTypeMutation.isPending ? 'Saving...' : 'Save Device Type'}
                    </Button>
                  </CardFooter>
                </form>
              ) : (
                <>
                  <CardContent className="space-y-6">
                    {selectedDeviceTypeDetails ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
                            <p>{selectedDeviceTypeDetails.name}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                            <p>{selectedDeviceTypeDetails.category}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                          <p>{selectedDeviceTypeDetails.description}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Compatible Protocols</h3>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {Array.isArray(selectedDeviceTypeDetails.compatibleProtocols) 
                              ? selectedDeviceTypeDetails.compatibleProtocols.map((protocol: string) => (
                                  <div key={protocol} className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm inline-flex items-center">
                                    {protocol}
                                  </div>
                                ))
                              : null
                            }
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">Select a device type to view details</p>
                    )}
                  </CardContent>
                  
                  {selectedDeviceTypeDetails && (
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this device type?')) {
                            deleteDeviceTypeMutation.mutate(selectedDeviceTypeDetails.id);
                          }
                        }}
                        disabled={deleteDeviceTypeMutation.isPending}
                      >
                        {deleteDeviceTypeMutation.isPending ? 'Deleting...' : 'Delete'}
                      </Button>
                      <Button 
                        onClick={() => {
                          setEditingDeviceType(true);
                        }}
                      >
                        Edit Device Type
                      </Button>
                    </CardFooter>
                  )}
                </>
              )}
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive security alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive security alerts via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="slack-notifications">Slack Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive security alerts via Slack
                  </p>
                </div>
                <Switch
                  id="slack-notifications"
                  checked={slackNotifications}
                  onCheckedChange={setSlackNotifications}
                />
              </div>
              
              {slackNotifications && (
                <div className="space-y-2">
                  <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                  <Input id="slack-webhook" placeholder="https://hooks.slack.com/services/..." />
                  <p className="text-sm text-muted-foreground">
                    Enter the webhook URL from your Slack workspace
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button>Save Notification Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>
                Configure external system integrations
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="suricataPath">Suricata Log Path</Label>
                  <Input 
                    id="suricataPath" 
                    {...register("suricataPath")} 
                  />
                  <p className="text-sm text-muted-foreground">
                    Path to the Suricata EVE JSON log file
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input 
                    id="apiKey" 
                    type="password" 
                    {...register("apiKey")} 
                  />
                  <p className="text-sm text-muted-foreground">
                    API key for external services (if required)
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Save Integration Settings</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Settings</CardTitle>
              <CardDescription>
                Configure scan intervals and monitoring preferences
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="auto-scan">Automatic Network Scanning</Label>
                    <p className="text-sm text-muted-foreground">
                      Periodically scan for new devices
                    </p>
                  </div>
                  <Switch
                    id="auto-scan"
                    checked={autoScan}
                    onCheckedChange={setAutoScan}
                  />
                </div>
                
                {autoScan && (
                  <div className="space-y-2">
                    <Label htmlFor="scanInterval">Scan Interval (minutes)</Label>
                    <Input 
                      id="scanInterval" 
                      type="number"
                      {...register("scanInterval")} 
                    />
                    <p className="text-sm text-muted-foreground">
                      How often to scan the network for new devices
                    </p>
                  </div>
                )}
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="alert-threshold">Alert Sensitivity</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue placeholder="Select sensitivity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Fewer Alerts)</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High (More Alerts)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Adjust the threshold for generating security alerts
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Save Monitoring Settings</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}