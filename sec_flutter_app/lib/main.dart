import 'package:flutter/material.dart';

import 'src/theme/app_theme.dart';
import 'src/ui/pages/integral_sec_page.dart';

void main() {
	WidgetsFlutterBinding.ensureInitialized();
	runApp(const SecApp());
}

class SecApp extends StatelessWidget {
	const SecApp({super.key});

	@override
	Widget build(BuildContext context) {
		return MaterialApp(
			title: 'Ahsec',
			debugShowCheckedModeBanner: false,
			theme: AppTheme.build(),
			home: const IntegralSecPage(),
		);
	}
}
