import { useState, useEffect, useCallback } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

import { getInitialValue } from '@/lib/utils';
import DynamicForm from './components/JSONValidator/DynamicForm';

const sampleJson = `{
  "isActive": "boolean",
  "username": "string",
  "age": "number",
  "joinDate": "date",
  "hobbies": [{
    "booleanField": "boolean",
    "stringField": "string"
  }],
  "address": {
    "isDefault": "boolean",
    "street": "string",
    "number": "number",
    "moveInDate": "date"
  }
}`;

// Main App Component
export default function App() {
  const [schema, setSchema] = useState<string>('');
  const [parsedSchema, setParsedSchema] = useState<SchemaType | null>(null);
  const [formState, setFormState] = useState<FormState>({});
  const [isJsonView, setIsJsonView] = useState(false);
  const [jsonData, setJsonData] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (schema) {
        const parsed = JSON.parse(schema);
        setParsedSchema(parsed);
        setFormState(getInitialValue(parsed));
        setError(null);
      }
    } catch (e) {
      setError('Invalid schema JSON');
      setParsedSchema(null);
    }
  }, [schema]);

  useEffect(() => {
    if (!isJsonView) {
      setJsonData(JSON.stringify(formState, null, 2));
    }
  }, [formState, isJsonView]);

  const handleJsonChange = useCallback((value: string) => {
    setJsonData(value);
    try {
      const parsed = JSON.parse(value);
      setFormState(parsed);
      setError(null);
    } catch (e) {
      setError('Invalid JSON data');
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Schema Definition</h2>
        </CardHeader>
        <CardContent>
          <Textarea
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            placeholder="Enter your schema JSON..."
            className="font-mono min-h-[200px]"
          />
          <Button
            onClick={() => {
              setSchema(sampleJson);
            }}
            className="ml-2 mt-2"
          >
            Load Sample
          </Button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </CardContent>
      </Card>

      {parsedSchema && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Dynamic Form</h2>
              <div className="flex items-center gap-2">
                <span>JSON</span>
                <Switch
                  checked={!isJsonView}
                  onCheckedChange={(checked) => setIsJsonView(!checked)}
                />
                <span>Form</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isJsonView ? (
              <Textarea
                value={jsonData}
                onChange={(e) => handleJsonChange(e.target.value)}
                className="font-mono min-h-[400px]"
              />
            ) : (
              <DynamicForm
                schema={parsedSchema}
                formState={formState}
                onChange={setFormState}
              />
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => console.log(formState)}
              className="w-full"
              disabled={!!error}
            >
              Submit
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
