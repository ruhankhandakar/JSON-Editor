import { useState, useEffect, useCallback } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

import { getInitialValue } from '@/lib/utils';
import DynamicForm from './components/JSONValidator/DynamicForm';
import { FormState, SchemaType, ValidationError } from './types';
import JsonEditor from './components/JSONValidator/JSONEditor';

const sampleJson = {
  isActive: 'boolean',
  username: 'string',
  age: 'number',
  joinDate: 'date',
  hobbies: [
    {
      booleanField: 'boolean',
      stringField: 'string',
    },
  ],
  address: {
    isDefault: 'boolean',
    street: 'string',
    number: 'number',
    moveInDate: 'date',
  },
} as SchemaType;

export default function App() {
  const [schema, setSchema] = useState<string>('');
  const [parsedSchema, setParsedSchema] = useState<SchemaType | null>(null);
  const [formState, setFormState] = useState<FormState>({});
  const [isJsonView, setIsJsonView] = useState(false);
  const [jsonData, setJsonData] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<FormState | null>(null);
  const [validationErrors, setValidationErrors] =
    useState<ValidationError | null>(null);

  useEffect(() => {
    try {
      if (schema) {
        const parsed = JSON.parse(schema);
        setParsedSchema(parsed);
        const initialState = getInitialValue(parsed);
        setFormState(initialState);
        setJsonData(JSON.stringify(initialState, null, 2));
        setError(null);
        setValidationErrors(null);
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

  const handleJsonChange = useCallback(
    (value: string) => {
      setJsonData(value);
      try {
        const parsed = JSON.parse(value);
        setFormState(parsed);
        setError(null);
        // Validate as user types in JSON view
        if (parsedSchema) {
          const errors = validateFormState(parsedSchema, parsed);
          setValidationErrors(errors);
        }
      } catch (e) {
        setError('Invalid JSON data');
      }
    },
    [parsedSchema],
  );

  const validateFormState = (
    schema: SchemaType | null,
    formState: FormState,
  ): ValidationError | null => {
    const errors: ValidationError = {};

    const validate = (schema: any, formState: any, path: string) => {
      if (Array.isArray(schema)) {
        if (!Array.isArray(formState)) {
          errors[path] = 'Expected an array';
        } else {
          formState.forEach((item, index) => {
            validate(schema[0], item, `${path}.${index}`);
          });
        }
      } else if (typeof schema === 'object') {
        for (const key in schema) {
          validate(schema[key], formState[key], `${path}.${key}`);
        }
      } else {
        switch (schema) {
          case 'boolean':
            if (typeof formState !== 'boolean') {
              errors[path] = 'Expected a boolean';
            }
            break;
          case 'number':
            if (typeof formState !== 'number') {
              errors[path] = 'Expected a number';
            }
            break;
          case 'string':
            if (typeof formState !== 'string') {
              errors[path] = 'Expected a string';
            }
            break;
          case 'date':
            if (
              typeof formState !== 'string' ||
              (formState && isNaN(Date.parse(formState)))
            ) {
              errors[path] = 'Expected a valid date string';
            }
            break;
          default:
            break;
        }
      }
    };

    validate(schema, formState, '');

    return Object.keys(errors).length > 0 ? errors : null;
  };

  const handleSubmit = () => {
    if (parsedSchema) {
      const errors = validateFormState(parsedSchema, formState);
      setValidationErrors(errors);
      if (errors) {
        setError('Please fix the validation errors before submitting.');
      } else {
        console.log(formState);
        setSubmittedData(formState);
        setError(null);
        setValidationErrors(null);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Schema Definition</h2>
        </CardHeader>
        <CardContent>
          <JsonEditor value={schema} onChange={setSchema} height="300px" />
          <Button
            onClick={() => {
              setSchema(JSON.stringify(sampleJson, null, 2));
            }}
            className="ml-2 mt-2"
          >
            Load Sample
          </Button>
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
            <div className="text-center py-2">
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
            {isJsonView ? (
              <JsonEditor
                value={jsonData}
                onChange={handleJsonChange}
                validationErrors={validationErrors}
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
              onClick={handleSubmit}
              className="w-full"
              disabled={!!error}
            >
              Submit
            </Button>
          </CardFooter>
        </Card>
      )}
      {submittedData && (
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">Submitted Data</h2>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap font-mono">
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
