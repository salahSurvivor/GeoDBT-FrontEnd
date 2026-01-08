import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { GenericService } from '../../../../core/services/generic.service';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { Vehicule } from '../../../../core/models//vehicule.model';
import * as ExcelJS from 'exceljs';
import * as fs from 'file-saver';
import * as FileSaver from 'file-saver';
import localeFr from '@angular/common/locales/fr';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localeFr);

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { Menu } from 'primeng/menu';
import { Select } from 'primeng/select';
import { KeyFilterModule } from 'primeng/keyfilter';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

// Angular Forms
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Toast } from "primeng/toast";

@Component({
  selector: 'app-flotte-vehicules',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    Menu,
    Select,
    KeyFilterModule,
    Toast, ConfirmDialogModule
  ],
  templateUrl: './flotte-vehicules.html',
  styleUrls: ['./flotte-vehicules.css']
})
export class FlotteVehicules implements OnInit {

  /* -------------------------------------------------------------------
   *  🌟 PROPRIÉTÉS GLOBALES
   * ------------------------------------------------------------------- */

  avatar = "/mnt/data/9c6b64a166d12446c275c7b23a870a5f.webp";

  dialogName: any;
  typeVehicule: any;
  vehiculeCarburant: any;

  //vehiculeModel = { matricule: '', marque: '', modele: '' };
  vehiculeRecord: Vehicule = {
    immatriculation: '',
    vehiculeMarqueId: '',
    vehiculeModeleId: '',
    vehiculeCarburantId: '',
    annee: 0,
    numeroChassis: '',
    etat: ''
  };

  vehiculeModele: any;
  vehiculeMarque: any;

  newRecord = { code: '', nom: '' };
  loading = false;
  subscriptions: Subscription[] = [];

  /* -------------------------------------------------------------------
 *  ⚙️ CONSTRUCTOR
 * ------------------------------------------------------------------- */

  constructor(private fb: FormBuilder, private genericService: GenericService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {
    this.form = this.fb.group({
      matricule: [''],
      marque: [''],
      modele: [''],
      carburant: [''],
      type: [''],
      etat: ['Disponible']
    });
  }

  ngOnInit(): void {
    this.getFlotteVehiculeList()
  }

  currentPage: number = 1;
  paginatorNumber: number = 20;
  totalRecords!: number;
  sytemPagination(event: any) {
    this.currentPage = event.first / event.rows + 1;
    this.paginatorNumber = event.rows;
    this.getFlotteVehiculeList();
  }

  paramsAdapt(isExcel?: boolean) {
    if (isExcel)
      this.paginatorNumber = 10000000;

    let params = {
      currentPage: this.currentPage,
      paginatorNumber: this.paginatorNumber
    }

    return params;
  }

  getFlotteVehiculeList() {
    const params = this.paramsAdapt();
    this.loading = true;

    const subscription = this.genericService.readWithPaginatorSystem('vehicule', params).subscribe({
      next: (list) => {
        const items = JSON.parse(JSON.stringify(list));
        this.flotteVehiculeList = items.data;
        this.totalRecords = items.total;

        this.getVehiculeOptions();
        this.loading = false;
        this.cdr.markForCheck();
        this.showCarburantModal = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de l\'enregistrement' });
        this.cdr.markForCheck();
        console.error('Erreur:', err);
      }
    });

    this.subscriptions.push(subscription);
  }

  /* -------------------------------------------------------------------
   *  📌 TABLE — Données
   * ------------------------------------------------------------------- */

  items = [
    {
      label: 'Modifier',
      icon: 'pi pi-pencil',
      command: () => this.onEdit(this.selectedFlotteVehicule)
    },
    {
      label: 'Supprimer',
      icon: 'pi pi-trash',
      command: () => this.confirmDelete(this.selectedFlotteVehicule)
    }
  ];

  /* -------------------------------------------------------------------
   *  📌 SELECT OPTIONS
   * ------------------------------------------------------------------- */

  vehiculeTypeOptions = [
    { code: 1, nom: 'Citadine' },
    { code: 2, nom: 'Sedan' },
    { code: 3, nom: 'Berline' }
  ];

  vehiculeCarburantOptions = [
    { code: '1', nom: 'Diesel' },
    { code: '2', nom: 'Essence' },
    { code: '3', nom: 'GPL' }
  ];

  vehiculeModeleOptions: any[] = [];
  vehiculeMarqueOptions: any[] = [];

  etats = [
    { nom: "Disponible" },
    { nom: "En maintenance" },
    { nom: "Indisponible" }
  ];
  marques = ['Peugeot', 'Renault', 'Dacia'];
  types = ['Citadine', 'Sedan', 'Berline'];

  /* -------------------------------------------------------------------
   *  📌 ÉTAT DES UI (Dialogues, Filtres…)
   * ------------------------------------------------------------------- */

  showForm = false;
  showFilters = false;
  showAddModal = false;

  showModal = false;
  showCarburantModal = false;

  /* -------------------------------------------------------------------
   *  📌 FORMULAIRE (ReactiveForms)
   * ------------------------------------------------------------------- */

  form!: FormGroup;
  flotteVehiculeList: any[] = [];
  selectedFlotteVehicule: any;

  vehicleForm = new FormGroup({
    immatriculation: new FormControl('', Validators.required),
    vehiculeMarqueId: new FormControl('', Validators.required),
    vehiculeModeleId: new FormControl('', Validators.required),
    vehiculeCarburantId: new FormControl('', Validators.required),
    etat: new FormControl('', Validators.required),
    numeroChassis: new FormControl('', Validators.required),
    annee: new FormControl(''),
  });

  filters = {
    marque: '',
    carburant: '',
    etat: '',
    type: '',
  };

  /* -------------------------------------------------------------------
   *  📌 MÉTHODES CRUD
   * ------------------------------------------------------------------- */

  openForm() {
    this.showForm = true;
  }

  submitRecord() {
    this.onEditRec ? this.editRecord() : this.saveRecord();
  }

  saveRecord() { 
    console.log('vehiculeRecord: ');
    this.loading = true;

    const subscription = this.genericService.create(this.vehiculeRecord, 'vehicule').subscribe({
      next: (list) => {
        this.getFlotteVehiculeList();
        this.loading = false;
        this.showModal = false;
        this.vehicleForm.reset();
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Vous êtes enregistré avec succès !' });
        this.cdr.markForCheck();
        this.showAddModal = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de l\'enregistrement' });
        this.cdr.markForCheck();
        console.log('Erreur:', err);
      }
    });

    this.subscriptions.push(subscription);
  }

  editRecord() {
    this.loading = true;

    const subscription = this.genericService.update(this.vehiculeRecord, 'vehicule').subscribe({
      next: (list) => {
        const data = JSON.parse(JSON.stringify(list));
        this.getFlotteVehiculeList();
        this.loading = false;
        this.showModal = false;
        this.vehicleForm.reset();
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Vous êtes enregistré avec succès !' });
        this.cdr.markForCheck();
        this.showAddModal = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de l\'enregistrement' });
        this.cdr.markForCheck();
        console.log('Erreur:', err);
      }
    });

    this.subscriptions.push(subscription);
  }
  onEditRec: boolean = false;
  onEdit(v: any) { 
    this.onEditRec = true;

    this.showModal = true;
    this.vehiculeRecord = { ...v };
    this.vehiculeRecord.vehiculeMarqueId = v.vehiculeMarqueId?._id;
    this.vehiculeRecord.vehiculeModeleId = v.vehiculeModeleId?._id;
    this.vehiculeRecord.vehiculeCarburantId = v.vehiculeCarburantId?._id;
  }

  onAdd() {
    this.onEditRec = false;
    this.showModal = true;
    this.vehicleForm.reset();
  }

  onCancel() {
    this.showModal = false;
    this.vehicleForm.reset(); 
  }

  confirmDelete(v: any) {
    this.confirmationService.confirm({
      message: 'Tu es sûr de vouloir supprimer cet enregistrement ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',

      acceptLabel: 'Oui',
      rejectLabel: 'Non',

      accept: () => {
        this.delete(v);
      }
    });
  }

  delete(v: any) {
    this.genericService.delete('vehicule', v._id).subscribe({
      next: () => {
        this.flotteVehiculeList = this.flotteVehiculeList.filter(item => item._id !== v._id);
        this.messageService.add({ severity: 'success', summary: 'Supprimé', detail: 'Véhicule supprimé avec succès' });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de supprimer' });
        console.error(err);
      }
    });
  }
  refresh() { this.getFlotteVehiculeList() }

  /* -------------------------------------------------------------------
   *  📌 FILTRES
   * ------------------------------------------------------------------- */

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  applyFilters() {
    console.log('Filtres appliqués : ', this.filters);
  }

  /* -------------------------------------------------------------------
   *  📌 DIALOG: Ajouter carburant / marque / modèle
   * ------------------------------------------------------------------- */
  add(entity: string) {
    console.log('entity: ', entity);
    this.loading = true;

    const subscription = this.genericService.create(this.newRecord, entity).subscribe({
      next: (list) => {
        const data = JSON.parse(JSON.stringify(list));
        this.addFaster(data); 
        this.loading = false;
        this.newRecord = { code: '', nom: '' };
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Vous êtes enregistré avec succès !' });
        this.cdr.markForCheck();
        this.showAddModal = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de l\'enregistrement' });
        this.cdr.markForCheck();
        console.log('Erreur:', err);
      }
    });

    this.subscriptions.push(subscription);
  }


  addFaster(data?: any) {
    if (this.dialogName == 'Ajouter une marque') {
      if (!data)
        this.add('vehicule-marque');
      else {
        this.vehiculeMarqueOptions.push(data);
        this.vehiculeRecord.vehiculeMarqueId = data._id;
      }

    }
    else if (this.dialogName == 'Ajouter un carburant') {
      if (!data)
        this.add('vehicule-carburant');
      else {
        this.vehiculeCarburantOptions.push(data);
        this.vehiculeRecord.vehiculeCarburantId = data._id;
      }
    }
    else if (this.dialogName == 'Ajouter un modèle') {
      if (!data)
        this.add('vehicule-modele');
      else {
        this.vehiculeModeleOptions.push(data);
        this.vehiculeRecord.vehiculeModeleId = data._id;
      }
    }
  }
  

  getVehiculeOptions() {
    this.loading = true;

    const subscription = this.genericService.read('vehicule').subscribe({
      next: (list) => {
        const data = JSON.parse(JSON.stringify(list));
        this.vehiculeCarburantOptions = data.vehiculeCarburantList;
        this.vehiculeModeleOptions = data.vehiculeModeleList;
        this.vehiculeMarqueOptions = data.vehiculeMarqueList;

        this.loading = false;
        this.cdr.markForCheck();
        this.showCarburantModal = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de l\'enregistrement' });
        this.cdr.markForCheck();
        console.error('Erreur:', err);
      }
    });

    this.subscriptions.push(subscription);
  }

  showAddDialog(title: any) {
    this.dialogName = title;
    this.showAddModal = true;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  excelData: any[] = [];
  getFlotteVehiculeListForExport() {
    const params = this.paramsAdapt(true);
    this.loading = true;

    const subscription = this.genericService.readWithPaginatorSystem('vehicule', params).subscribe({
      next: (list) => {
        const data = JSON.parse(JSON.stringify(list));
        this.excelData = data.data;
        this.downloadExcel();

        this.loading = false;
        this.cdr.markForCheck();
        this.showCarburantModal = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de l\'enregistrement' });
        this.cdr.markForCheck();
        console.error('Erreur:', err);
      }
    });

    this.subscriptions.push(subscription);
  }

  //#region excel
  downloadExcel(): void {

    const time = formatDate(new Date(), 'shortTime', 'fr-FR');
    const date = formatDate(new Date(), 'fullDate', 'fr-FR');
    const fullDate = `${date} ${time}`;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Véhicules');

    // ======================== STYLES ========================= //

    const headerStyle = {
      font: { bold: true, size: 12 },
      alignment: { horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4EC3CF' }
      }
    };

    const cellStyle = {
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };

    // ======================== TITRE ========================= //

    worksheet.getCell('A1').value = 'Liste des Véhicules';
    worksheet.getCell('A1').font = { bold: true, size: 22 };
    worksheet.mergeCells('A1:E1');

    worksheet.getCell('F1').value = `Date : ${fullDate}`;
    worksheet.getCell('F1').alignment = { horizontal: 'right' };
    worksheet.mergeCells('F1:H1');

    worksheet.addRow([]);

    // ======================== HEADER ========================= //

    const header = [
      'Véhicule',
      'Année',
      'Numéro de châssis',
      'Marque',
      'Modèle',
      'Carburant',
      'État'
    ];

    const headerRow = worksheet.addRow(header);

    headerRow.eachCell(cell => {
      Object.assign(cell, { style: headerStyle });
    });

    worksheet.columns = header.map(() => ({ width: 25 }));

    // ======================== ROWS DATA ========================= //
    this.excelData.forEach(v => {
      const row = worksheet.addRow([
        v.immatriculation,
        v.annee,
        v.numeroChassis,
        v.vehiculeMarqueId?.nom,
        v.vehiculeModeleId?.nom,
        v.vehiculeCarburantId?.nom,
        v.etat
      ]);

      row.eachCell(cell => {
        Object.assign(cell, { style: cellStyle });
      });
    });

    // ======================== DOWNLOAD ========================= //

    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      FileSaver.saveAs(blob, `Vehicules_${Date.now()}.xlsx`);
    });

  }
  //#endregion excel
}