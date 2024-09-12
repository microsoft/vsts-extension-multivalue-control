# Multi-value-control

The Multi-Value Control Azure DevOps Extension enhances work item forms by enabling the selection of multiple values within a single field. This functionality is ideal for scenarios requiring categorization under multiple tags.

# Documentation

> Currently only available on TFS 2017 or later and Azure DevOps.

## How to get started

Navigate to your work item form customization page and add a multivalue control.
Edit the control so it can use the right field to store your selection and the right set of values to be displayed.
Be sure to allow user inputed values if a picklisk (string) field is used to back the extension.

- Navigate to Project Settings and select Process. From there, choose the work item type to which you would like to add a custom field
- (WorkItem)[marketplace/img/workItemType.png]

- Select customization page and add a multivalue control.
  ![Add Custom Control](marketplace/img/addcustomControl.png)

- Select Multivalue-Control
  ![MultiValue](marketplace/img/MultiValue.png)

- Select the field for the control and choose the appropriate values for the control.
  ![Custom Control](marketplace/img/customControl.png)

## XML process template

To define the layout for a work item type using XML, you'll need to add the Multivalue control to your layout

[Learn more](https://github.com/Microsoft/vsts-extension-multivalue-control/blob/master/xmldetails.md) about how to customize the multivalue control directly on XML.

# How to query

The selected values are stored in a semicolon separated format. To search for items that have a specific value use the "Contains Words" operator. If searching for multiple values, use multipe "Contains Words" clauses for that field.

You can also learn how to build your own custom control extension for the work item form [here](https://www.visualstudio.com/en-us/docs/integrate/extensions/develop/custom-control).

# Support

## How to file issues and get help

This project uses [GitHub Issues](https://github.com/Microsoft/vsts-extension-multivalue-control/issues) to track bugs and feature requests. Please search the existing issues before filing new issues to avoid duplicates. For new issues, file your bug or feature request as a new Issue.

## Microsoft Support Policy

Support for this project is limited to the resources listed above.