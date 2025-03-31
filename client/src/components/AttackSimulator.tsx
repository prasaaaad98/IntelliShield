import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Device {
  id: number;
  name: string;
  type: string;
  protocol: string;
}

interface AttackParameters {
  register?: string;
  coil?: string;
  topic?: string;
  nodeId?: string;
  value?: string;
  payload?: string;
  duration?: string;
  [key: string]: string | undefined;
}

export default function AttackSimulator() {
  const { toast } = useToast();
  const [attackType, setAttackType] = useState('');
  const [targetId, setTargetId] = useState<number | null>(null);
  const [paramType, setParamType] = useState('register');
  const [paramValue, setParamValue] = useState('');
  
  // Fetch devices for target selection
  const { data: devices } = useQuery<Device[]>({
    queryKey: ['/api/devices'],
  });
  
  // Get compatible devices based on attack type
  const compatibleDevices = devices?.filter(device => {
    if (!attackType) return true;
    
    if (attackType === 'modbus_write') {
      return device.protocol === 'Modbus';
    } else if (attackType === 'mqtt_spoof') {
      return device.protocol === 'MQTT';
    } else if (attackType === 'opcua_tamper') {
      return device.protocol === 'OPC-UA';
    }
    
    return true; // DOS and MITM can target any device
  });
  
  // Get parameter options based on attack type
  const getParameterOptions = () => {
    switch (attackType) {
      case 'modbus_write':
        return ['register', 'coil'];
      case 'mqtt_spoof':
        return ['topic'];
      case 'opcua_tamper':
        return ['nodeId'];
      case 'dos':
      case 'mitm':
        return ['duration'];
      default:
        return ['register'];
    }
  };
  
  // Handle attack type change
  const handleAttackTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setAttackType(newType);
    setTargetId(null);
    setParamType(getParameterOptions()[0]);
    setParamValue('');
  };
  
  // Handle target change
  const handleTargetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    setTargetId(id);
  };
  
  // Execute attack mutation
  const executeMutation = useMutation({
    mutationFn: async (parameters: { attackType: string, targetId: number, parameters: AttackParameters }) => {
      return apiRequest('POST', '/api/attacks/simulate', parameters);
    },
    onSuccess: async (response) => {
      const result = await response.json();
      toast({
        title: 'Attack Simulation Executed',
        description: result.message,
      });
      
      // Refresh relevant data
      queryClient.invalidateQueries({ queryKey: ['/api/attacks/logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
    },
    onError: (error) => {
      toast({
        title: 'Simulation Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Handle execute attack
  const handleExecuteAttack = () => {
    if (!attackType) {
      toast({
        title: 'Missing attack type',
        description: 'Please select an attack type',
        variant: 'destructive',
      });
      return;
    }
    
    if (!targetId) {
      toast({
        title: 'Missing target',
        description: 'Please select a target device',
        variant: 'destructive',
      });
      return;
    }
    
    if (!paramValue) {
      toast({
        title: 'Missing parameter value',
        description: 'Please enter a parameter value',
        variant: 'destructive',
      });
      return;
    }
    
    // Build parameters object
    const parameters: AttackParameters = {};
    parameters[paramType] = paramValue;
    
    // For some attack types, we need to add additional parameters
    if (attackType === 'modbus_write') {
      parameters.value = paramValue;
    } else if (attackType === 'mqtt_spoof') {
      parameters.payload = 'simulated_payload';
    } else if (attackType === 'opcua_tamper') {
      parameters.value = paramValue;
    }
    
    // Execute attack
    executeMutation.mutate({
      attackType,
      targetId,
      parameters
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-neutral-200">
        <h3 className="text-lg font-medium text-neutral-800">Attack Simulator</h3>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {/* Attack Type Selection */}
          <div>
            <label htmlFor="attack-type" className="block text-sm font-medium text-neutral-700">Attack Type</label>
            <select
              id="attack-type"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              value={attackType}
              onChange={handleAttackTypeChange}
            >
              <option value="">Select an attack type</option>
              <option value="modbus_write">Modbus Unauthorized Write</option>
              <option value="mqtt_spoof">MQTT Message Spoofing</option>
              <option value="opcua_tamper">OPC-UA Data Tampering</option>
              <option value="dos">Denial of Service</option>
              <option value="mitm">Man in the Middle</option>
            </select>
          </div>
          
          {/* Target Device Selection */}
          <div>
            <label htmlFor="target-device" className="block text-sm font-medium text-neutral-700">Target Device</label>
            <select
              id="target-device"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              value={targetId || ''}
              onChange={handleTargetChange}
              disabled={!attackType}
            >
              <option value="">Select a target device</option>
              {compatibleDevices?.map((device) => (
                <option key={device.id} value={device.id}>{device.name}</option>
              ))}
            </select>
          </div>
          
          {/* Attack Parameters */}
          <div>
            <label htmlFor="attack-parameters" className="block text-sm font-medium text-neutral-700">Attack Parameters</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <div className="relative flex items-stretch flex-grow focus-within:z-10">
                <input
                  type="text"
                  id="attack-parameters"
                  className="focus:ring-primary focus:border-primary block w-full rounded-none rounded-l-md sm:text-sm border-neutral-300"
                  placeholder="Parameter Value"
                  value={paramValue}
                  onChange={(e) => setParamValue(e.target.value)}
                  disabled={!targetId}
                />
              </div>
              <select
                className="-ml-px relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-r-md text-neutral-700 bg-neutral-50 hover:bg-neutral-100 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                value={paramType}
                onChange={(e) => setParamType(e.target.value)}
                disabled={!targetId}
              >
                {getParameterOptions().map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Warning */}
          <div className="rounded-md bg-neutral-50 p-4 border border-neutral-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-warning" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-neutral-700">
                  These are safe simulations and will not cause real harm to systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-neutral-50 p-4 border-t border-neutral-200">
        <button
          className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-accent shadow-sm hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          onClick={handleExecuteAttack}
          disabled={executeMutation.isPending || !attackType || !targetId || !paramValue}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          {executeMutation.isPending ? 'Executing...' : 'Execute Attack Simulation'}
        </button>
      </div>
    </div>
  );
}
