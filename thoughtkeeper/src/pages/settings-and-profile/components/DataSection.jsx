import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { useNotifications } from '../../../components/ui/NotificationToast';

const DataSection = () => {
  const { showSuccess, showWarning, showError } = useNotifications();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [exportOptions, setExportOptions] = useState({
    thoughts: true,
    tasks: true,
    folders: true,
    tags: true,
    metadata: false
  });

  const storageData = {
    used: "2.4 MB",
    total: "100 MB",
    percentage: 2.4,
    breakdown: [
      { type: "Thoughts", size: "1.8 MB", count: "1,247" },
      { type: "Tasks", size: "0.4 MB", count: "156" },
      { type: "Images", size: "0.2 MB", count: "23" },
      { type: "Other", size: "0.1 MB", count: "-" }
    ]
  };

  const exportFormatOptions = [
    { value: 'json', label: 'JSON Format' },
    { value: 'csv', label: 'CSV Spreadsheet' },
    { value: 'pdf', label: 'PDF Document' },
    { value: 'markdown', label: 'Markdown Files' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsExporting(false);
    showSuccess(`Data exported successfully as ${exportFormat?.toUpperCase()}!`);
  };

  const handleImport = async () => {
    setIsImporting(true);
    
    // Simulate import process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsImporting(false);
    showSuccess("Data imported successfully!");
  };

  const handleClearCache = () => {
    showWarning("Cache cleared successfully!");
  };

  const handleDeleteAllData = () => {
    showError("This action cannot be undone. Please contact support if you need to delete all data.");
  };

  const handleExportOptionChange = (option, checked) => {
    setExportOptions(prev => ({ ...prev, [option]: checked }));
  };

  return (
    <div className="space-y-6">
      {/* Storage Usage */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
          <Icon name="HardDrive" size={20} className="mr-2" />
          Storage Usage
        </h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-foreground">Used Storage</span>
              <span className="text-sm font-medium text-foreground">
                {storageData?.used} of {storageData?.total}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${storageData?.percentage}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            {storageData?.breakdown?.map((item, index) => (
              <div key={index} className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium text-foreground">{item?.type}</div>
                <div className="text-xs text-text-secondary mt-1">
                  {item?.size} • {item?.count} items
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Export Data */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
          <Icon name="Download" size={20} className="mr-2" />
          Export Data
        </h3>
        
        <div className="space-y-4">
          <Select
            label="Export Format"
            description="Choose the format for your exported data"
            options={exportFormatOptions}
            value={exportFormat}
            onChange={setExportFormat}
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Include in Export</label>
            <div className="space-y-2">
              <Checkbox
                label="Thoughts and notes"
                checked={exportOptions?.thoughts}
                onChange={(e) => handleExportOptionChange('thoughts', e?.target?.checked)}
              />
              <Checkbox
                label="Tasks and to-dos"
                checked={exportOptions?.tasks}
                onChange={(e) => handleExportOptionChange('tasks', e?.target?.checked)}
              />
              <Checkbox
                label="Folders and organization"
                checked={exportOptions?.folders}
                onChange={(e) => handleExportOptionChange('folders', e?.target?.checked)}
              />
              <Checkbox
                label="Tags and labels"
                checked={exportOptions?.tags}
                onChange={(e) => handleExportOptionChange('tags', e?.target?.checked)}
              />
              <Checkbox
                label="Metadata and timestamps"
                checked={exportOptions?.metadata}
                onChange={(e) => handleExportOptionChange('metadata', e?.target?.checked)}
              />
            </div>
          </div>
          
          <Button
            variant="default"
            onClick={handleExport}
            loading={isExporting}
            iconName="Download"
            iconPosition="left"
            fullWidth
          >
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
      </div>
      {/* Import Data */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
          <Icon name="Upload" size={20} className="mr-2" />
          Import Data
        </h3>
        
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Import your thoughts and tasks from a previously exported file or from other applications.
          </p>
          
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Icon name="Upload" size={32} className="text-text-secondary mx-auto mb-2" />
            <p className="text-sm text-foreground mb-2">Drop your file here or click to browse</p>
            <p className="text-xs text-text-secondary">Supports JSON, CSV, and Markdown files</p>
          </div>
          
          <Button
            variant="outline"
            onClick={handleImport}
            loading={isImporting}
            iconName="Upload"
            iconPosition="left"
            fullWidth
          >
            {isImporting ? 'Importing...' : 'Import Data'}
          </Button>
        </div>
      </div>
      {/* Data Management */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
          <Icon name="Database" size={20} className="mr-2" />
          Data Management
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <div className="text-sm font-medium text-foreground">Clear Cache</div>
              <div className="text-xs text-text-secondary">Remove temporary files and cached data</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              iconName="Trash2"
            >
              Clear
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <div className="text-sm font-medium text-foreground">Optimize Storage</div>
              <div className="text-xs text-text-secondary">Compress and optimize your data storage</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              iconName="Zap"
            >
              Optimize
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div>
              <div className="text-sm font-medium text-destructive">Delete All Data</div>
              <div className="text-xs text-destructive/80">Permanently remove all thoughts, tasks, and settings</div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAllData}
              iconName="Trash2"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
      {/* Data Retention */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
          <Icon name="Clock" size={20} className="mr-2" />
          Data Retention
        </h3>
        
        <div className="space-y-3">
          <Checkbox
            label="Auto-delete completed tasks after 30 days"
            description="Automatically remove completed tasks to keep your workspace clean"
           
            onChange={() => {}}
          />
          
          <Checkbox
            label="Archive old thoughts after 1 year"
            description="Move thoughts older than 1 year to archive folder"
            checked
            onChange={() => {}}
          />
          
          <Checkbox
            label="Keep deleted items in trash for 30 days"
            description="Allow recovery of accidentally deleted items"
            checked
            onChange={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default DataSection;