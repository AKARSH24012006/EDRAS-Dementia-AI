"""
================================================================================
MASTER PDF COMPILER FOR TASKS 1 TO 9 EXPERIMENTS
================================================================================
Compiles all 9 machine learning practice experiments into a single, publication-grade,
comprehensive PDF document containing complete Python source code, high-resolution 
visual graphs/plots, statistical evaluation tables, and comparative benchmarks.
================================================================================
"""

import sys
import os
import re
from pathlib import Path

try:
    import reportlab
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "reportlab"])

from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle, Preformatted, Image, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas


class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to add 'Page X of Y' page numbers and running header/footer.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor('#0284c7'))

        # Header (Skip cover page 1)
        if self._pageNumber > 1:
            self.drawString(36, 760, "EDRAS MEDTECH PLATFORM — MACHINE LEARNING SUITE (TASKS 1 – 9)")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor('#64748b'))
            self.drawRightString(576, 760, "Comprehensive Master Report")
            self.setStrokeColor(colors.HexColor('#cbd5e1'))
            self.setLineWidth(0.75)
            self.line(36, 752, 576, 752)

            # Footer
            self.line(36, 45, 576, 45)
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor('#64748b'))
            self.drawString(36, 30, "Confidential — Healthcare AI & Clinical Decision Support Systems")
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(576, 30, page_text)

        self.restoreState()


def build_master_pdf():
    base_dir = Path(os.path.dirname(os.path.abspath(__file__)))
    pdf_out_path = base_dir / "EDRAS_COMPREHENSIVE_TASKS_1_TO_9_MASTER_BOOK.pdf"

    print(f"\n[INIT] Building Master PDF Report at: {pdf_out_path.name}")

    doc = SimpleDocTemplate(
        str(pdf_out_path),
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        alignment=1, # Center
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        alignment=1,
        textColor=colors.HexColor('#0284c7'),
        spaceAfter=20
    )

    meta_box_style = ParagraphStyle(
        'MetaBox',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        alignment=1,
        textColor=colors.HexColor('#334155')
    )

    h1_style = ParagraphStyle(
        'TaskH1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=colors.HexColor('#0369a1'),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'TaskH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'TaskBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=6
    )

    code_style = ParagraphStyle(
        'TaskCode',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=7,
        leading=9,
        textColor=colors.HexColor('#0f172a'),
        backColor=colors.HexColor('#f8fafc'),
        borderColor=colors.HexColor('#cbd5e1'),
        borderWidth=0.5,
        borderPadding=6,
        spaceBefore=6,
        spaceAfter=10,
        wordWrap='CJK'
    )

    caption_style = ParagraphStyle(
        'PlotCaption',
        parent=styles['Italic'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=11,
        alignment=1,
        textColor=colors.HexColor('#475569'),
        spaceAfter=12
    )

    story = []

    # =========================================================================
    # COVER / HEADER SECTION
    # =========================================================================
    story.append(Spacer(1, 15))
    story.append(Paragraph("EDRAS MedTech Platform", subtitle_style))
    story.append(Paragraph("Master Technical Report: ML Experiments (Tasks 1 – 9)", title_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#0284c7'), spaceAfter=15))

    meta_text = """
    <b>Dataset Source</b>: Brain MRI & Clinical Metadata (86,437 Image Scans, 10,880 CSV Rows)<br/>
    <b>Classification Targets</b>: Non Demented, Very Mild Dementia, Mild Dementia, Moderate Dementia<br/>
    <b>Author</b>: EDRAS MedTech Machine Learning & AI Engineering Division<br/>
    <b>Status</b>: 100% Tasks Executed, Validated, and Compiled
    """
    story.append(Paragraph(meta_text, meta_box_style))
    story.append(Spacer(1, 15))

    # Master Performance Summary Table
    summary_data = [
        ["Task #", "Experiment Name", "Algorithm / Model", "Primary Metric", "Score / Result"],
        ["Task 1", "Import & Load Data", "PIL & Pandas Loader", "Dataset Coverage", "100% (86,437 images)"],
        ["Task 2", "Summary Statistics", "Exploratory EDA", "Class Imbalance Ratio", "50.5:1 (CSV)"],
        ["Task 3", "Linear Regression", "Ridge & OLS Regression", "R² Score / RMSE", "R² = 0.228, RMSE = 0.976"],
        ["Task 4", "Logistic Reg. & SVM", "SVM (RBF Kernel)", "5-Fold CV Accuracy", "72.81% Acc (0.725 F1)"],
        ["Task 5", "Clustering (GMM/Hier)", "K-Means Clustering", "Silhouette / Calinski-H.", "Sil = 0.2767, CH = 749.28"],
        ["Task 6", "PCA Dimension Reduction", "Principal Component Analysis", "Cumulative Variance (4 PCs)", "96.69% Variance Retained"],
        ["Task 7", "Hidden Markov Models", "Gaussian HMM & Viterbi", "Viterbi Decoding Acc", "40.50% Acc (LL = -2160.14)"],
        ["Task 8", "CART Decision Trees", "CART Tree (Gini Impurity)", "5-Fold CV Accuracy", "81.81% 5-Fold CV Acc"],
        ["Task 9", "Ensemble Learning", "Random Forest Ensemble", "Test / CV Accuracy / OOB", "85.00% Acc (OOB = 84.84%)"]
    ]

    t_summary = Table(summary_data, colWidths=[45, 110, 140, 115, 130])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0284c7')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8.5),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f1f5f9')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))

    story.append(t_summary)
    story.append(Spacer(1, 20))
    story.append(PageBreak())

    # =========================================================================
    # TASK DETAILS DEFINITIONS (1 THROUGH 9)
    # =========================================================================
    tasks_info = [
        {
            "num": 1,
            "title": "Task 1: Import, Load, and View Dataset",
            "script": "task1_import_load_view.py",
            "desc": "Devised a program to load multi-class Brain MRI scans and tabular metadata, verifying target class balance and generating grid previews.",
            "plots": [
                ("task1_csv_class_distribution.png", "Figure 1.1: Dementia Stage Distribution Bar Chart across CSV data files."),
                ("task1_sample_images_grid.png", "Figure 1.2: Sample Brain MRI Scans Grid across 4 Dementia Severity Stages.")
            ]
        },
        {
            "num": 2,
            "title": "Task 2: Dataset Summary and Statistics Analysis",
            "script": "task2_dataset_summary_statistics.py",
            "desc": "Computed comprehensive exploratory statistics, pixel brightness variance, inter-feature correlation heatmaps, and image dimensions.",
            "plots": [
                ("task2_tabular_statistics.png", "Figure 2.1: Target Class Percentages and Proportions in Dataset."),
                ("task2_correlation_matrix.png", "Figure 2.2: Inter-feature Correlation Heatmap."),
                ("task2_image_statistics.png", "Figure 2.3: Mean Pixel Intensity Distribution and File Size Boxplot per Stage.")
            ]
        },
        {
            "num": 3,
            "title": "Task 3: Linear Regression for Severity Index Prediction",
            "script": "task3_linear_regression.py",
            "desc": "Implemented Ordinary Least Squares (OLS), Ridge (L2), and Lasso (L1) regression models to predict continuous Dementia Severity Index scores (0.0 to 3.0).",
            "plots": [
                ("task3_regression_results.png", "Figure 3.1: OLS / Ridge Linear Regression Actual vs. Predicted Severity Index Plot."),
                ("task3_residual_analysis.png", "Figure 3.2: Residual Error Scatter Plot and Error Distribution Histogram.")
            ]
        },
        {
            "num": 4,
            "title": "Task 4: Bayesian Logistic Regression & Support Vector Machines (SVM)",
            "script": "task4_bayesian_logistic_svm.py",
            "desc": "Implemented Bayesian/L2 Logistic Regression and Support Vector Classifiers (Linear, RBF, and Polynomial kernels) for multi-class categorization.",
            "plots": [
                ("task4_svm_logistic_confusion_matrix.png", "Figure 4.1: Normalized Confusion Matrices for Logistic Regression vs. SVM (RBF Kernel)."),
                ("task4_model_comparison_metrics.png", "Figure 4.2: Classification Accuracy, Weighted F1, and 5-Fold CV Score Comparison."),
                ("task4_multiclass_roc_curves.png", "Figure 4.3: One-vs-Rest (OvR) ROC Curves and AUC Scores across 4 Dementia Stages.")
            ]
        },
        {
            "num": 5,
            "title": "Task 5: K-Means, GMM, and Hierarchical Clustering",
            "script": "task5_clustering_gmm_hierarchical.py",
            "desc": "Implemented unsupervised clustering using K-Means, Gaussian Mixture Models (GMM), and Agglomerative Hierarchical Clustering (Ward linkage).",
            "plots": [
                ("task5_kmeans_elbow_silhouette.png", "Figure 5.1: K-Means Elbow Curve (Inertia vs K) and Silhouette Score Progression."),
                ("task5_clustering_pca_scatter.png", "Figure 5.2: 2D PCA Cluster Projections (K-Means, GMM, Hierarchical vs Ground Truth)."),
                ("task5_hierarchical_dendrogram.png", "Figure 5.3: Agglomerative Hierarchical Clustering Tree Dendrogram.")
            ]
        },
        {
            "num": 6,
            "title": "Task 6: Principal Component Analysis (PCA) Dimensionality Reduction",
            "script": "task6_pca_dimensionality_reduction.py",
            "desc": "Decomposed 11-dimensional feature space into principal component loadings, calculating eigenvalues and cumulative explained variance ratios.",
            "plots": [
                ("task6_pca_scree_variance.png", "Figure 6.1: PCA Scree Plot and Cumulative Variance Explained Curve (90% Threshold)."),
                ("task6_pca_feature_loadings.png", "Figure 6.2: Heatmap of Principal Component Loadings (PC1, PC2, PC3)."),
                ("task6_pca_biplot_2d_3d.png", "Figure 6.3: 2D and 3D Principal Component Projection Scatter Plots.")
            ]
        },
        {
            "num": 7,
            "title": "Task 7: Hidden Markov Models (HMM) for Sequential Prediction",
            "script": "task7_hmm_sequential_prediction.py",
            "desc": "Constructed Gaussian Hidden Markov Model (HMM) and Viterbi dynamic programming decoder to model longitudinal dementia progression trajectories.",
            "plots": [
                ("task7_hmm_transition_matrix.png", "Figure 7.1: State Transition Probability Matrix Heatmap (A)."),
                ("task7_hmm_viterbi_progression.png", "Figure 7.2: Longitudinal Patient Trajectory Decoding (True vs Viterbi State)."),
                ("task7_hmm_emission_distributions.png", "Figure 7.3: Gaussian Emission Probability Density Functions B_j(O) per State.")
            ]
        },
        {
            "num": 8,
            "title": "Task 8: CART (Classification and Regression Trees) Decision Trees",
            "script": "task8_cart_decision_trees.py",
            "desc": "Implemented CART Decision Tree Classifiers using Gini Impurity and Information Gain (Entropy) criteria, extracting feature importances and depth pruning curves.",
            "plots": [
                ("task8_cart_decision_tree_structure.png", "Figure 8.1: Pruned CART Decision Tree Visual Diagram (max_depth=4)."),
                ("task8_cart_feature_importance.png", "Figure 8.2: Bar Chart Ranking Gini Feature Importances (MDI)."),
                ("task8_cart_depth_pruning_curve.png", "Figure 8.3: Training vs Validation Accuracy across Maximum Tree Depths.")
            ]
        },
        {
            "num": 9,
            "title": "Task 9: Ensemble Learning (Random Forest, Gradient Boosting, Voting)",
            "script": "task9_ensemble_learning.py",
            "desc": "Implemented ensemble classifiers combining Bagging (Random Forest), Boosting (Gradient Boosting & AdaBoost), and Soft Voting to maximize accuracy.",
            "plots": [
                ("task9_ensemble_model_benchmarks.png", "Figure 9.1: Ensemble Model Performance Benchmarks (Accuracy, F1, 5-Fold CV)."),
                ("task9_ensemble_confusion_matrices.png", "Figure 9.2: Normalized Confusion Matrices for Random Forest and Soft Voting Ensemble."),
                ("task9_ensemble_feature_importances.png", "Figure 9.3: Feature Importances Comparison (Random Forest vs Gradient Boosting MDI).")
            ]
        }
    ]

    # Process each task sequentially into the document
    for t_info in tasks_info:
        story.append(Paragraph(t_info["title"], h1_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#0284c7'), spaceAfter=8))
        story.append(Paragraph(f"<b>Overview & Objectives</b>: {t_info['desc']}", body_style))

        # Read Python Script Code
        script_file = base_dir / t_info["script"]
        if script_file.exists():
            with open(script_file, "r", encoding="utf-8") as f:
                code_text = f.read()

            # Truncate script if extremely long for compact formatting
            if len(code_text) > 4000:
                lines = code_text.splitlines()
                code_snippet = "\n".join(lines[:120]) + "\n\n# ... [Source Code Truncated for PDF Layout] ..."
            else:
                code_snippet = code_text

            story.append(Paragraph(f"<b>Python Source Code (`{t_info['script']}`)</b>:", h2_style))
            story.append(Preformatted(code_snippet, code_style))

        # Add Plot Images
        story.append(Paragraph("<b>Experimental Visual Graphs & Output Plots</b>:", h2_style))
        for img_name, caption in t_info["plots"]:
            img_path = base_dir / img_name
            if img_path.exists():
                # Printable width = 540 pt
                img_obj = Image(str(img_path), width=480, height=270)
                story.append(img_obj)
                story.append(Paragraph(caption, caption_style))

        story.append(Spacer(1, 10))
        story.append(PageBreak())

    # Build Document with NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"\n[SUCCESS] Master PDF successfully generated: {pdf_out_path.name}")
    return pdf_out_path


if __name__ == "__main__":
    build_master_pdf()
