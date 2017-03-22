In TFS, the layout for a work item type is defined via XML. Therefore, you will have to add the Multivalue control to your layout. Here's the series of steps that tell you how to do it.
 
Learn more about WebLayout XML [here](https://www.visualstudio.com/docs/work/reference/weblayout-xml-elements).

# How to get started
1.  Open the `Developer Command Prompt`.  Export the XML file to your desktop with the following command.
    ```
    witadmin exportwitd /collection:CollectionURL /p:Project /n:TypeName /f:FileName
    ```

2. This will create a file in the directory that you specified.  Open this file and search for "Work Item Extensions".

    ```xml
        <!--**********************Work Item Extensions**********************

Extension:
	Name: vsts-extensions-multivalue-control
	Id: ms-devlabs.vsts-extensions-multivalue-control

	Control contribution:
		Id: ms-devlabs.vsts-extensions-multivalue-control.multivalue-form-control
		Description: A work item form control which allows selection of multiple values.
		Inputs:
			Id: FieldName
			Description: 
			Type: WorkItemField
			Field Type: String; PlainText; HTML
			Data Type: String
			IsRequired: true

			Id: Values
			Description: Values can be user provided or from suggested values of the backing field
			Data Type: String
			IsRequired: false


Note: For more information on work item extensions use the following topic:
http://go.microsoft.com/fwlink/?LinkId=816513
-->
    ```

4. Add an Extension tag to make the control available to the work item form. 

     ```xml
        <!--**********************************Work Item Extensions***************************
        ...

        Note: For more information on work item extensions use the following topic:
        http://go.microsoft.com/fwlink/?LinkId=816513
        -->

        <Extensions>
            <Extension Id="ms-devlabs.vsts-extensions-multivalue-control" />
        </Extensions>
     ```

    You can find your extension ID within the commented blob for "Work Item Extensions": 

    ```XML
        <!--**********************************Work Item Extensions***************************

    Extension:
        Name: vsts-extensions-multivalue-control
        Id: ms-devlabs.vsts-extensions-multivalue-control
        ...
    ```

5. Add the ControlContribution tag for your Multivalue control. This example adds it to the "Planning" group.
    ```xml
    <Page Id="Details">
    ...
        <Section>
        ...
            <Group Id="Planning">
            ...
                <ControlContribution Label="Label" Id="ms-devlabs.vsts-extensions-multivalue-control.multivalue-form-control"
                    <Inputs>
                        <Input Id="FieldName" Value="RefNameOfTheField" />
                    </Inputs>
                </ControlContribution>

                <Control Label="Risk" Type="FieldControl" FieldName="Microsoft.VSTS.Common.Risk" />
    ```

     You can find the contribution ID and input information within the commented blob for "Work Item Extensions": 

    ```XML
        <!--**********************************Work Item Extensions***************************
     ...

	Control contribution:
		Id: ms-devlabs.vsts-extensions-multivalue-control.multivalue-form-control
		Description: A work item form control which allows selection of multiple values.
		Inputs:
			Id: FieldName
			Description: 
			Type: WorkItemField
			Field Type: String; PlainText; HTML
			Data Type: String
			IsRequired: true

			Id: Values
			Description: Values can be user provided or from suggested values of the backing field
			Data Type: String
			IsRequired: false
    ```

6. Re-import the *.xml* file, using witadmin. 
    ```
    witadmin importwitd /collection:CollectionURL /p:Project /f:FileName
    ``` 

