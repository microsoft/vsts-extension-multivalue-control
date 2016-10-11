

 A work item type is defined by XML, including the layout of the work item form.  As part of the walkthrough, you will add the control to the layout.  [Read more information on WebLayout XML](https://www.visualstudio.com/docs/work/reference/weblayout-xml-elements).  In this example, we will add the control to the Agile "user story".

1.  Open the `Developer Command Prompt`.  Export the XML file to your desktop with command shown below.
    ```
    witadmin exportwitd /collection:CollectionURL /p:Project /n:TypeName /f:FileName
    ```
2. This creates a file in the directory that you specified.  Inside this file, navigate to the section called "Work Item Extensions".  This section shows the documentation of the control such as the inputs and ids.  All this information was defined in the manifest, *vss-extension.json*.

    ```xml
        <!--**********************************Work Item Extensions***************************

        Extension:
            Name: vsts-extensions-multi-values-control
            Id: ms-vsts-witiq.vsts-extensions-multi-values-control

            Control contribution:
                Id: ms-vsts-witiq.vsts-extensions-multi-values-control.multi-values-form-control
                Description: 
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

4. Add an extension tag below the "Work Item Extensions" section as shown below to make your control available to work item form. 

     ```xml
        <!--**********************************Work Item Extensions***************************
        ...

        Note: For more information on work item extensions use the following topic:
        http://go.microsoft.com/fwlink/?LinkId=816513
        -->

        <Extensions>
            <Extension Id="ms-vsts-witiq.vsts-extensions-multi-values-control" />
        </Extensions>
     ```

5. Find your extension ID in the "Work Item Extensions" section: 

    ```XML
        <!--**********************************Work Item Extensions***************************

    Extension:
        Name: vsts-extensions-multi-values-control
        Id: ms-vsts-witiq.vsts-extensions-multi-values-control
        ...
    ```

6. This extension is a contribution, so you add it with a contribution tag in place of the <Control> tag. This example adds the "ControlContribution" to the "Planning" group.
    ```xml
    <Page Id="Details">
    ...
        <Section>
        ...
            <Group Id="Planning">
            ...
                <ControlContribution Label="Priority" Id="<your-control-contribution-id>"
                    <Inputs>
                        <Input Id="FieldName" Value="Microsoft.VSTS.Common.Priority" />
                    </Inputs>
                </ControlContribution>

                <Control Label="Risk" Type="FieldControl" FieldName="Microsoft.VSTS.Common.Risk" />
    ```

7. Finally, import this *.xml* file, using witadmin. 
    ```
    witadmin importwitd /collection:CollectionURL /p:Project /f:FileName
    ``` 

