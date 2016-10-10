> Currently only available on TFS "15" or later and Visual Studio Team Services. 

![Work Item Form](img/form.png)

# Select multiple values for your fields
![Control](img/operatingSystem.png)

# Expand the control only when needed
![Control Collapsed](img/operatingSystemCollapsed.png)

![Control Expanded](img/operatingSystemExpanded.png)

# How to get started
## Visual Studio Team Services

1. Navigate to your work item form customization page and add a Multivalue Control.

![Layout Customization](img/layoutCustomization.png)

2. Edit the control so it can use the right field to store your selection and the right set of values to be displayed.

![Options](img/options.png)

## TFS On-Premise
We recommend TFS 2015 RC2 and higher when running this extension.

[Learn more](https://github.com/Microsoft/vsts-extension-color-control/blob/master/README.md) about how to customize the color control directly on XML.

# How to query

The selected values are stored in a semicolon seperated format.  To search for items that have a specific value use the contains words operator.  If searching for multiple values use multipe contains words clauses for that field.

# Feedback 

We appreciate your feedback! Here are some ways to connect with us:

* Add a review below.
* Send us an [email](mailto://witiq@microsoft.com).

> Microsoft DevLabs is an outlet for experiments from Microsoft, experiments that represent some of the latest ideas around developer tools. Solutions in this category are designed for broad usage, and you are encouraged to use and provide feedback on them; however, these extensions are not supported nor are any commitments made as to their longevity.