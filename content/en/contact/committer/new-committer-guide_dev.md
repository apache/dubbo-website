---
aliases:
    - /en/contact/committer/new-committer-guide_dev/
description: Apache Committer Registration Process
linkTitle: Registration Process
title: Apache Committer Registration Process
type: docs
weight: 1
---




## I. Generation of Apache Committers

### Initial Committers during Project Incubation

During the project incubation phase, there will be an option for the initial committers list in the incubation project proposal. Confirm that you are one of the initial committers. Once the project is voted through by the Apache Incubator community, committers can begin preparing to register their accounts. Refer to the [incubator wiki](https://wiki.apache.org/incubator/).

### Active Contributors Elected as Committers

During later stages of development, active contributors can be elected as committers. See [How to Become a Committer](https://www.apache.org/dev/new-committers-guide.html#becoming-a-committer).

## II. Individual Developer Submits ICLA

### 1. Choose Apache ID
Check the registered Apache IDs on the [Apache Committer Index page](http://people.apache.org/committer-index.html).

### 2. Individual Contributor License Agreement (ICLA):
Download the [ICLA Template](https://www.apache.org/licenses/icla.pdf) and search for available IDs. Fill in your personal information on icla.pdf correctly, print it, sign it, scan it, and send it as an attachment to secretary@apache.org. The secretary will assist in creating an Apache user ID. An email address your_id@apache.org will also be created, which you can check on the [Apache Committer Index page](http://people.apache.org/committer-index.html) to see if your user has been created.

### 3. Mentor Assists in Submitting User ID Creation Request
The mentor will help submit a request to the root email group for creating the Apache account, and someone will assist in establishing the ID. It generally takes about 2 days for the account to be established, please wait and check the [Apache Committer Index page](http://people.apache.org/committer-index.html) for your user.

## III. Join Apache Developer Group
1. Log in to the [Apache Account Tool](https://id.apache.org/) and click "Forgot Password" to set the initialization password. A password reset email will be sent to the forward email (the developer email submitted in the incubation project proposal).
2. Regarding Apache email: The apache.org email does not have its own email content storage server. It requires borrowing the email content storage and distribution functions of other email providers. It is recommended to use Apache email during many voting sessions.
   There is a question here about how to configure the apache.org email forwarding function in other email accounts:
   * Inbox: Receive emails sent to apache.org. This can be achieved by configuring the forward email in step one of the Apache Account Tool.
   * Outbox: Outgoing emails display the sending email address as apache.org email. Please refer to the [Apache Email Setup Guide](https://reference.apache.org/committer/email) and [Gmail Email Settings](https://support.google.com/mail/answer/22370). It can be inconvenient to find configuration methods for other email services; Gmail is the most convenient, so it is recommended to switch to a Gmail account (not an advertisement).
3. Modify the homepage URL on the edit page. You can add your homepage link in your account on the [Apache Committer Index page](http://people.apache.org/committer-index.html).
4. Modify the GitHub account (username) on the edit page. After submission and confirmation, you will receive an email inviting you to join the github.com/apache-committers group within two hours. During this time, you can read the [ASF Working Methods](http://www.apache.org/foundation/how-it-works.html#developers) for a basic understanding of ASF development.

## IV. Committers Acquire Write Access to Projects

Operations for the [GitBox Account Linking Tool](https://gitbox.apache.org/setup/)

### Apache Account Authorization
Authorize the Apache account login via OAuth protocol according to the prompts.

### GitHub Account Authorization
Authorize the GitHub account login via OAuth protocol according to the prompts.

### Set Up Two-Factor Authorization (2FA) for GitHub Account
Follow the [Authorize GitHub 2FA Wiki](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication) and proceed as follows:
* Install the “Google Authenticator” app on your phone.
* Follow the steps in the [Authorize GitHub 2FA Wiki](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication) step by step.

   In the [Two-Factor Authorization Verification](https://github.com/settings/security) interface, it is not recommended to choose to scan the QR code with your phone, as some phones may not be able to scan it. Please open the “Google Authenticator” app on your phone, tap “+”, and select “Enter provided key”: In the “Account name” input box, write the GitHub account. In the “Your key” input box, write the text in the link "enter this text code" on the opened webpage. After clicking "Add" in the app, a 6-digit dynamic code will be generated for this account. Write this 6-digit code into the text box on the webpage, then click “Enable.” Thus, 2FA will be successfully set up.

* Log out and log back into GitHub. After entering the username and password, you will have an additional step to enter the dynamic password, which is the dynamic password displayed in the Google Authenticator.

* It may take about half an hour for you to receive an email notification that you have joined the xx project-committers developer group. You can also go to the [Apache Teams](https://github.com/orgs/apache/teams) page to check.

* After submitting 2FA, you will have permission verification issues for the project you have already cloned. The solutions are as follows:
  * Apply for an Access Token:
   After generating an access token on GitHub, you can paste the token where the command line requires a password.
   Refer to the official [Help Link One](https://docs.github.com/cn/repositories/creating-and-managing-repositories/troubleshooting-cloning-errors#provide-access-token-if-2fa-enabled) and [Help Link Two](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).
  * Switch to SSH:
   Execute the ssh-keygen command in the command line, then paste the content from the pub file into GitHub.

* Note: Make sure that GitHub's 2FA is in "enabled" status. When you set 2FA to "off," you will be removed from the corresponding Apache committer write permission group until you set it successfully again.

## V. Others

### The Apache Way
For details, please refer to the [wiki](http://apache.org/foundation/governance/).

Community is more important than code. If an issue or proposal has not been discussed in the community (mailing list), it is considered not to have occurred.

### Small Benefits

JetBrains offers a small benefit to Apache committers, allowing them to use the full product line of IDEA for free. The specific registration address is: https://www.jetbrains.com/shop/eform/apache?product=ALL

### Related Wiki
https://www.apache.org/dev/new-committers-guide.html
