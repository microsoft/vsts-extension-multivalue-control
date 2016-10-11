> This is currently only available on Visual Studio Team Services and TFS "15" or later.

## Customize your work item form with a multivalue control ##

In our old extensibility model, the multi-value control found on CodePlex was widely used by our customers to bring custom business logic to their work items. Given the importance of this control we've decided to bring it to the new extensibility framework.

With this extension you can represent Text (single line) and Text (multiple lines) fields with an easy-to-use multivalue control on the work item form.  

![Field Types](dist/img/fieldtypes.png)

## Quick steps to get started ##

Navigate to your work item type layout page of the process you want to customize and click "Add Custom Control"

![Add Custom Control](dist/img/addcustomcontrol.png)

Select the multivalue control on the "Definition" tab

![Definition](dist/img/definition.png)

On the "Options" tab enter the field name to be backed by the multivalue control, and enter in the list of values to be displayed

![Options](dist/img/options.png)

## Querying ##

The selected values are stored in a semicolon seperated format.  To search for items that have a specific value use the contains words operator.  If searching for multiple values use multipe contains words clauses for that field.

## Supported browsers ##

* Internet Explorer
* Microsoft Edge
* Google Chrome 
* Firefox

## Feedback ##

We appreciate your feedback! Here are some ways to connect with us:

* Add a review below.
* Send us an [email](mailto://witiq@microsoft.com).